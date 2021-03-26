import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { Accounts } from "meteor/accounts-base";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { FlowRouter } from "meteor/kadira:flow-router";
import { Guests } from "../guests/guests.js";
import { Roles } from "meteor/meteor-roles";
import { Agencies } from "../agencies/agencies.js";
import { AdminInvitations } from "./invitations.js";
import {
  AgencyInvitationsSchema,
  InvitationAcceptSchema,
  AdminUserInvitationSchema,
} from "./schema.js";
import { Events } from "../events/events.js";
import { IsAllowed } from "../adminusers/isInRole.js";
import { insertActivity } from "../../api/activity_record/methods.js";
import _ from "lodash";
import { insertEventMeetingGuestInvitation } from "../events_meeting_invitation/methods.js";
import { Event_Meeting_Guest_Invitation } from "../events_meeting_invitation/events_meeting_invitation.js";
import { Event_Meetings } from "../events_meeting/event_meetings.js";

var roles = ["admin", "freelancer", "client"];
let isAllowed = (userId, role) => {
  let scopes = Roles.getScopesForUser(userId);
  if (scopes.length > 0) {
    for (var i = 0; i < scopes.length; i++) {
      if (Roles.userIsInRole(userId, role, scopes[i])) {
        return true;
      }
    }
    return false;
  }
  return Roles.userIsInRole(userId, role);
};
//code to insert data in Activity Record
function activityRecordInsert(data) {
  var activityEvent = "";
  var activityUserInfo = {
    id: Meteor.userId(),
    name: Meteor.user().profile.name,
    email: Meteor.user().emails[0].address,
  };
  if (data.eventId == null || data.eventId == "" || data.eventId == undefined) {
    activityEvent = "general";
  } else {
    var event = Events.findOne(data.eventId);
    activityEvent = event.basicDetails.eventName;
  }
  var date = new Date();
  userdata = {
    activityeDateTime: date,
    activityUserInfo: activityUserInfo,
    activityModule: data.activityModule,
    activitySubModule: data.activitySubModule,
    activityEvent: activityEvent,
    activityMessage: data.activityMessage,
  };
  insertActivity.call(userdata, (err, res) => {
    if (err) {
      return 0;
    } else {
      return true;
    }
  });
}
function sendInvitationToGuests(data, eventId) {
  let invite;
  let i = 0;
  let switchCase = data;
  let event = eventId;
  switch (switchCase) {
    case "allGuests":
      invite = Guests.find({
        eventId: event,
        guestIsPrimary: true,
      }).fetch();
      break;
    case "notLoggedIn":
      invite = Guests.find({
        eventId: event,
        guestIsPrimary: true,
        guestInviteSent: true,
        appLoginTime: { $exists: false },
      }).fetch();
      break;
    case "newGuests":
      invite = Guests.find({
        eventId: event,
        guestIsPrimary: true,
        guestInviteSent: false,
      }).fetch();
      break;
    default:
      throw new Meteor.Error(
        "Could not process request- Internal server Error"
      );
  }
  if (invite.length < 1) {
    throw new Meteor.Error("Guests not found.");
  } else {
    while (i < invite.length) {
      Guests.update(invite[i]._id, { $set: { guestInviteSent: true } });
      activityInsertData = {
        eventId: invite[i].eventId,
        activityModule: "Guests",
        activitySubModule: "Invitation",
        event: "Invite send",
        activityMessage:
          "Invitation is send to guest member " +
          invite[i].guestTitle +
          " " +
          invite[i].guestFirstName +
          " " +
          invite[i].guestLastName +
          ".",
      };
      activityRecordInsert(activityInsertData);
      if (Meteor.isServer) {
        require("./server/sendGuestInvitation.js").SendGuestInvite(invite[i]);
      }
      i++;
    }
  }
}

export const addAgencyInvitation = new ValidatedMethod({
  name: "Invitations.agency.insert",
  validate: AgencyInvitationsSchema.validator({ clean: true }),
  run(invite) {
    if (!isAllowed(this.userId, "invite-agency")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    var alreadyInvited = AdminInvitations.findOne({
      type: "agency",
      $or: [{ name: invite.name }, { email: invite.email }],
    });

    var alreadyExists = Agencies.findOne({
      name: invite.name,
    });

    if (alreadyInvited || alreadyExists) {
      throw new Meteor.Error("Already Invited");
    }

    invite.type = "agency";
    invite.token = Random.hexString(16);
    invite.role = "admin";
    invite.from = "THE KEY <admin@thekey.com>";
    invite.date = new Date().toISOString();
    if (Meteor.isServer) {
      require("./server/sendInvitation.js").SendInvite(invite);
    }
  },
});

export const resendAgencyInvitation = new ValidatedMethod({
  name: "Invitations.agency.resend",
  validate: null,
  run(invite) {
    if (!isAllowed(this.userId, "invite-agency")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    if (Meteor.isServer) {
      require("./server/sendInvitation.js").SendInvite(invite, false);
    }
  },
});

export const sendGuestInvitation = new ValidatedMethod({
  name: "Invitations.guest.send",
  validate: null,
  run(invite) {
    if (isAllowed(this.userId, "guests-invite-send")) {
      Guests.update(invite._id, { $set: { guestInviteSent: true } });

      //code to insert data in Activity Record
      activityInsertData = {
        eventId: invite.eventId,
        activityModule: "Guests",
        activitySubModule: "Invitation",
        event: "Invite send",
        activityMessage:
          "Invitation is send to guest member " +
          invite.guestTitle +
          " " +
          invite.guestFirstName +
          " " +
          invite.guestLastName +
          ".",
      };
      activityRecordInsert(activityInsertData);
    } else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
    if (!isAllowed(this.userId, "invite-guest")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    if (Meteor.isServer) {
      require("./server/sendGuestInvitation.js").SendGuestInvite(invite);
    }
  },
});

export const sendGuestMeetingEventInvitation = new ValidatedMethod({
  name: "Invitations.event.guest.send",
  validate: null,
  run(invite) {
    let inviteData = {};
    if (isAllowed(this.userId, "guests-invite-send")) {
      // //Guests.update(invite._id, { $set: { "guestInviteSent": true } });

      const objData = {
        guestId: invite.guestId,
        eventMeeting_id: invite.eventMeeting_id,
        invitationSentStatus: false,
        invitationResendCount: 0,
        eventId: invite.eventId,
      };

      const Event_Meeting_Guest_Invitation_Id = Event_Meeting_Guest_Invitation.insert(
        objData
      );

      inviteData = {
        ...invite,
        Event_Meeting_Guest_Invitation_Id: Event_Meeting_Guest_Invitation_Id,
      };

      //code to insert data in Activity Record
      activityInsertData = {
        eventId: invite.eventId,
        activityModule: "Guests",
        activitySubModule: "Invitation",
        event: "Invite send",
        activityMessage:
          "Event Meeting Invitation is send to guest member " +
          invite.guestTitle +
          " " +
          invite.guestFirstName +
          " " +
          invite.guestLastName +
          ".",
      };
      activityRecordInsert(activityInsertData);
    } else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
    if (!isAllowed(this.userId, "invite-guest")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    if (Meteor.isServer) {
      require("./server/sendGuestEventMeetingInvitation.js").SendGuestInvite(
        inviteData
      );
    }
  },
});

export const sendAllGuestInvitation = new ValidatedMethod({
  name: "Invitations.guest.allsend",
  validate: null,
  run({ option, eventId }) {
    if (isAllowed(this.userId, "guests-invite-send")) {
      if (Meteor.isServer) {
        if (option === "1") {
          sendInvitationToGuests("allGuests", eventId);
        } else if (option === "2") {
          sendInvitationToGuests("notLoggedIn", eventId);
        } else if (option === "3") {
          sendInvitationToGuests("newGuests", eventId);
        }
      }
    }
  },
});

export const sendAllGuestMeetingInvitation = new ValidatedMethod({
  name: "MeetingInvitations.guest.allsend",
  validate: null,
  run(meetingDetails) {
    if (isAllowed(this.userId, "guests-invite-send")) {
      if (Meteor.isServer) {
        // if (option === "1") {
        //   sendMeetingInvitationToGuests("all_guest", eventId, meetingDetails);
        // } else if (option === "2") {
        //   sendMeetingInvitationToGuests(
        //     "not_logged_guest",
        //     eventId,
        //     meetingDetails
        //   );
        // } else if (option === "3") {
        //   sendMeetingInvitationToGuests("new_guest", eventId, meetingDetails);
        // }

        return sendMeetingInvitationToGuests(meetingDetails);
      }
    }
  },
});

function sendMeetingInvitationToGuests(meetingDetails) {
  const { eventId, inviteGuestList, listType, meetingId, _id } = meetingDetails;

  let i = 0;

  let searchParam = {
    eventId,
    guestIsPrimary: true,
  };

  Event_Meetings.update(_id, {
    $set: {
      invitationSentStatus: meetingDetails.invitationSentStatus + 1,
    },
  });

  switch (listType) {
    case "all_guest":
      if (inviteGuestList && inviteGuestList.length > 0) {
        searchParam = {
          ...searchParam,
          _id: {
            $in: inviteGuestList,
          },
        };
      }
      invitedGuestList = Guests.find(searchParam).fetch();
      break;

    default:
      throw new Meteor.Error(
        "Could not process request- Internal server Error"
      );
  }

  if (inviteGuestList.length < 1) {
    throw new Meteor.Error("Guests not found.");
  } else {
    while (i < inviteGuestList.length) {
      let objData = {
        guestId: inviteGuestList[i],
        eventMeeting_id: _id,
        invitationsendCount: 0,
        eventId: eventId,
      };

      let objEvent_Meeting_Guest_Invitation = Event_Meeting_Guest_Invitation.findOne(
        {
          guestId: objData.guestId,
          eventMeeting_id: objData.eventMeeting_id,
        }
      );

      let Event_Meeting_Guest_Invitation_Id = "";

      if (objEvent_Meeting_Guest_Invitation) {
        Event_Meeting_Guest_Invitation.update(
          objEvent_Meeting_Guest_Invitation._id,
          {
            $set: {
              invitationsendCount:
                objEvent_Meeting_Guest_Invitation.invitationsendCount + 1,
            },
          }
        );
        Event_Meeting_Guest_Invitation_Id =
          objEvent_Meeting_Guest_Invitation._id;
      } else {
        Event_Meeting_Guest_Invitation_Id = Event_Meeting_Guest_Invitation.insert(
          objData
        );
      }

      objData = {
        ...objData,
        Event_Meeting_Guest_Invitation_Id,
      };

      activityInsertData = {
        eventId: inviteGuestList[i].eventId,
        activityModule: "Guests",
        activitySubModule: "Invitation",
        event: "Invite Meeting Send",
        activityMessage:
          "Event Meeting Invitation is send to guest member " +
          inviteGuestList[i].guestTitle +
          " " +
          inviteGuestList[i].guestFirstName +
          " " +
          inviteGuestList[i].guestLastName +
          ".",
      };

      activityRecordInsert(activityInsertData);
      console.log("inviteGuestList[i] 1", inviteGuestList[i]);
      if (Meteor.isServer) {
        require("./server/sendGuestEventMeetingInvitation.js").SendGuestInvite(
          objData
        );
      }
      i++;
    }
  }
}

let isClientOrFreelancer = (role) => {
  return role === "freelancer" || role === "client";
};

export const updateAdminEvents = new ValidatedMethod({
  name: "AdminUsers.update.freelancers.events",
  validate: null,
  run({ userId, selectedEvents }) {
    // ABL_SAM added Permission Check
    if (!IsAllowed(this.userId, "edit-freelancer-events")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    let oneSelected = false;
    if (!selectedEvents || selectedEvents.length < 1) {
      throw new Meteor.Error(
        "The freelancer/client needs to be connected to at least 1 event. Please Delete User if you wish to remove them from all the events."
      );
    }
    for (var i = 0; i < selectedEvents.length; i++) {
      if (selectedEvents.allow === true) {
        oneSelected = true;
        break;
      }
    }

    if (!oneSelected) {
      throw new Meteor.Error(
        "The freelancer/client needs to be connected to at least 1 event. Please Delete User if you wish to remove them from all the events."
      );
    }
    let evs = selectedEvents ? selectedEvents : [];
    let user = Meteor.users.findOne(userId);
    if (user) {
      let allowed = user.allowedEvents ? user.allowedEvents : [];
      _.each(evs, (e) => {
        if (e.allow) {
          if (allowed.indexOf(e.id) < 0) {
            allowed.push(e.id);
          }
        } else {
          if (allowed.indexOf(e.id) > -1) {
            _.remove(allowed, (a) => a === e.id);
          }
        }
      });
      Meteor.users.update(userId, {
        $set: {
          allowedEvents: allowed,
        },
      });
    }
  },
});

export const addAdminUserInvitation = new ValidatedMethod({
  name: "Invitations.agency.user",
  validate: AdminUserInvitationSchema.validator({ clean: true }),
  run(invite) {
    var agency = Agencies.findOne(invite.agency);
    var hasPermission =
      Roles.userIsInRole(this.userId, "invite-admin-user") ||
      Roles.userIsInRole(this.userId, "invite-admin-user", agency._id);
    if (!hasPermission) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }

    if (isClientOrFreelancer(invite.role)) {
      if (!invite.selectedEvents || invite.selectedEvents.length < 1) {
        throw new Meteor.Error("Select at least one event");
      }
    }

    var alreadyInvited = AdminInvitations.findOne({
      type: "admin-user",
      email: invite.email,
    });

    if (alreadyInvited) {
      if (
        isClientOrFreelancer(alreadyInvited.role) &&
        isClientOrFreelancer(invite.role)
      ) {
        if (alreadyInvited.role !== invite.role) {
          throw new Meteor.Error(
            "This email is already in use for a different role. Please invite using a different email ID"
          );
        }
        let eventsList = invite.selectedEvents;
        let oldEvents = alreadyInvited.selectedEvents;
        let finalEvents = oldEvents
          ? _.union(oldEvents, eventsList)
          : eventsList;
        AdminInvitations.update(alreadyInvited._id, {
          $set: {
            selectedEvents: finalEvents,
          },
        });
        return;
      } else {
        throw new Meteor.Error(
          "This email is already in use for a different role. Please invite using a different email ID"
        );
      }
    }

    let hasRole = (userId, rol) => {
      let scopes = Roles.getScopesForUser(userId);

      for (var i = 0; i < scopes.length; i++) {
        if (Roles.userIsInRole(userId, rol, scopes[i])) {
          return true;
        }
      }
      return false;
    };

    if (Meteor.isServer) {
      let alreadyExists = Accounts.findUserByEmail(invite.email);

      if (alreadyExists) {
        if (isClientOrFreelancer(invite.role)) {
          if (!hasRole(alreadyExists._id, invite.role)) {
            throw new Meteor.Error(
              "This email is already in use for a different role. Please invite using a different email ID"
            );
          }
          Roles.addUsersToRoles(alreadyExists._id, invite.role, invite.agency);
          let oldList = alreadyExists.allowedEvents;
          let eventsList = invite.selectedEvents;
          let finalList = oldList ? _.union(oldList, eventsList) : eventsList;
          Meteor.users.update(alreadyExists._id, {
            $set: {
              allowedEvents: finalList,
            },
          });
          return;
        } else {
          throw new Meteor.Error(
            "This email is already in use for a different role. Please invite using a different email ID"
          );
        }
      }
    }

    invite.from = `${agency.name} <${agency.email}>`;
    invite.agencyUser = agency.contactName;
    invite.agencyName = agency.name;
    invite.type = "admin-user";
    invite.token = Random.hexString(16);
    invite.date = new Date().toISOString();
    if (Meteor.isServer) {
      require("./server/sendInvitation.js").SendInvite(invite);
    }
  },
});

export const resendAdminUserInvitation = new ValidatedMethod({
  name: "ReSendInvitations.agency.user",
  validate: null,
  run(invite) {
    var agency = Agencies.findOne(invite.agency);
    var hasPermission =
      Roles.userIsInRole(this.userId, "invite-admin-user") ||
      Roles.userIsInRole(this.userId, "invite-admin-user", agency._id);
    if (!hasPermission) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    if (Meteor.isServer) {
      require("./server/sendInvitation.js").SendInvite(invite, false);
    }
  },
});

export const deleteAdminUser = new ValidatedMethod({
  name: "Admin.delete.user",
  validate: null,
  run({ userId, agencies }) {
    if (userId === this.userId) {
      throw new Meteor.Error("Cannot delete self");
    }
    if (!IsAllowed(this.userId, "delete-admin-user")) {
      throw new Meteor.Error("Not allowed");
    }
    if (Roles.userIsInRole(this.userId, "superadmin")) {
      Meteor.users.remove(userId);
    } else {
      agencies.forEach((sc) => {
        Roles.setUserRoles(userId, [], sc);
      });
    }
  },
});

export const changeAdminRole = new ValidatedMethod({
  name: "Admin.change.role",
  validate: null,
  run({ id, role, agency }) {
    if (role !== "admin" && role !== "member") {
      throw new Meteor.Error("Cannot change role to " + role + ". Not Allowed");
    }
    if (
      Roles.userIsInRole(this.userId, "change-user-role") ||
      Roles.userIsInRole(this.userId, "change-user-role", agency)
    ) {
      if (Roles.userIsInRole(id, "superadmin") || role === "superadmin") {
        throw new Meteor.Error("NOT ALLOWED");
      }
      var oldRoles = Roles.getRolesForUser(id, agency);
      if (Meteor.isServer) {
        if (oldRoles.length > 0) {
          Roles.removeUsersFromRoles(id, oldRoles, agency);
        }
        Roles.setUserRoles(id, role, agency);
      }
    } else {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
  },
});

export const cancelAdminUserInvitation = new ValidatedMethod({
  name: "Invitations.agency.user.cancel",
  validate: null,
  run({ id, agency }) {
    if (
      Roles.userIsInRole(this.userId, "remove-admin-invitation") ||
      Roles.userIsInRole(this.userId, "remove-admin-invitation", agency)
    ) {
      AdminInvitations.remove(id);
    } else {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS ACTION");
    }
  },
});

export const acceptInvitation = new ValidatedMethod({
  name: "Invitations.accept",
  validate: InvitationAcceptSchema.validator({ clean: true }),
  run(user) {
    if (Meteor.isServer) {
      require("./server/acceptInvitation.js").AcceptInvite(user);
    }
  },
});

export const cancelAgencyInvitation = new ValidatedMethod({
  name: "Invitations.agency.cancel",
  validate: null,
  run(id) {
    if (!Roles.userIsInRole(this.userId, "remove-agency-invitation")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS ACTION");
    }
    AdminInvitations.remove(id);
  },
});

export const getAdminSummaryDetails = new ValidatedMethod({
  name: "Admin.methods.get.summary",
  validate: null,
  run() {
    let invitiations = AdminInvitations.find();
    let users = Meteor.users.find({
      $and: [
        {
          "roles._id": "admin",
        },
        {
          "roles._id": {
            $ne: "superadmin",
          },
        },
      ],
    });

    let events = Events.find();
    let closedEvents = Events.find({
      "basicDetails.isEventClose": true,
    });

    let eventNames = events.map((e) => {
      return {
        name: e.basicDetails ? e.basicDetails.eventName : "",
        _id: e._id,
      };
    });

    return {
      invited: invitiations.count(),
      agencies: users.count(),
      events: events.count(),
      closedEvents: closedEvents.count(),
      eventNames,
    };
  },
});

export const updateUserProfile = new ValidatedMethod({
  name: "admin.profile.update",
  validate: null,
  run(data) {
    Meteor.users.update(Meteor.userId(), {
      $set: {
        profile: data,
      },
    });
  },
});
