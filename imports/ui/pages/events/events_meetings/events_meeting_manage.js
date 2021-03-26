// Notification section UIs
import "./events_meeting_manage.html";
import "./events_meeting_form.html";
import "./events_meeting_manage.scss";
import "./events_meetings.css";
import "./meetingGuestList";

// Npm Modules
import _ from "lodash";
import moment from "moment-timezone";

// Meteor specific files
import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { FlowRouter } from "meteor/kadira:flow-router";

import {
  showError,
  showSuccess,
} from "../../../components/notifs/notifications.js";

import { fetchGuestList } from "../../../../api/guests/methods.js";

// Database Calls

import { ReactiveVar } from "meteor/reactive-var";

import { Event_Meetings } from "../../../../api/events_meeting/event_meetings";
import {
  activateEventMeeting,
  createZoomMeeting,
  deleteEventMeeting,
  deleteZoomMeeting,
  insertEventMeeting,
  updateEventMeeting,
  updateEventMeetingStatus,
  updateZoomMeeting,
} from "../../../../api/events_meeting/methods";
import { sendAllGuestMeetingInvitation } from "../../../../api/adminusers/methods";

// Global Reactive Variables
let editing = new ReactiveVar(false);
let editId = new ReactiveVar("");
let deleteId = new ReactiveVar("");
let pageReady = new ReactiveVar(false);
let showGuests = new ReactiveVar();
let deleteModal = null;

Template.events_meeting_manage.onRendered(function () {
  pageReady.set(true);
  this.subscribe("event_meetings.event", FlowRouter.getParam("id"));
  this.subscribe("notifications.event", FlowRouter.getParam("id"));
  this.subscribe("guests.all", FlowRouter.getParam("id"));
  editing.set(false);

  Meteor.setTimeout(() => {
    this.$(".modal").modal();
    this.$(".tooltip-icon").tooltip({
      delay: 50,
    });
  }, 1000);
});

Template.events_meeting_manage.helpers({
  pageReady() {
    return pageReady.get() && Template.instance().subscriptionsReady();
  },
  addMeetingPath: () => {
    return FlowRouter.path("addEventMeeting", {
      id: FlowRouter.getParam("id"),
    });
  },
  eventMeetingList() {
    const eventMeetingCollections = Event_Meetings.find({
      eventId: FlowRouter.getParam("id"),
      removed: false,
    });
    return eventMeetingCollections;
  },
  meetingPath: () => {
    return FlowRouter.path("managemeeting", {
      id: FlowRouter.getParam("id"),
    });
  },
});

Template.events_meeting_manage.events({
  "click .add-notification"() {
    editing.set(false);
    Meteor.setTimeout(function () {
      // $('#user-list').select2();
      $("#user-list").val("").trigger("change");
    }, 500);
  },
});

Template.single_event_meeting.helpers({
  formatDate: function (date) {
    return moment(date).format("ddd, MMM Do YYYY, h:mm:ss a");
  },

  checkInviteStatus: function (n) {
    return n < 1 ? "Send Invitation" : "Resend Invitation";
  },

  isDisableButton: function (activateMeeting) {
    return !activateMeeting;
  },

  startEndMeeting: function (status) {
    return status === "start";
  },
});

// Card Buttons start
Template.single_event_meeting.events({
  "click #btnViewMeeting"(event, template) {
    event.preventDefault();
    FlowRouter.go("events.meeting.info", {
      id: FlowRouter.getParam("id"),
      meetingId: template.data.eventMeeting.meetingId,
    });
  },

  "click #btnSendMeetingInvite"(_event, template) {
    const meetingDetails = template.data.eventMeeting;
    sendAllGuestMeetingInvitation.call(meetingDetails, (err, _res) => {
      if (err) {
        showError(err.toString());
      } else {
        showSuccess("Invitation Sent");
      }
    });
  },

  "click #btnStartMeeting"(event, template) {
    const data = {
      _id: template.data.eventMeeting._id,
      status: "start",
    };
    updateEventMeetingStatus.call(data, (err, _res) => {
      if (err) {
        showError(err.toString());
      } else {
        showSuccess("Start Meeting");
      }
    });
  },

  "click #btnEndMeeting"(event, template) {
    const data = {
      _id: template.data.eventMeeting._id,
      status: "end",
    };
    updateEventMeetingStatus.call(data, (err, _res) => {
      if (err) {
        showError(err.toString());
      } else {
        showSuccess("End Meeting");
      }
    });
  },

  "click #btnDeleteMeeting"(_event, template) {
    deleteId.set(template.data.eventMeeting.meetingId);
    deleteModal.modal("open");
  },

  "click #btnEditMeeting"(_event, template) {
    const meetingId = template.data.eventMeeting.meetingId;
    const eventId = FlowRouter.getParam("id");
    editId.set(meetingId);
    FlowRouter.go("editEventMeeting", {
      id: eventId,
      meetingId,
    });
  },

  "click .btnActivatMeeting"(event, template) {
    const data = {
      _id: template.data.eventMeeting._id,
      activateMeeting: event.target.checked,
      status: event.target.checked ? "waiting" : "end",
    };
    activateEventMeeting.call(data, (err) => {
      if (err) {
        showError(err);
      } else {
        showSuccess(
          event.target.checked ? `Meeting Activated` : `Meeting Deactivated`
        );
      }
    });
  },
});
// Card Buttons end

Template.events_meeting_manage_delete.onRendered(function () {
  deleteModal = this.$(".modal");
  deleteModal.modal();
  this.autorun(() => {
    Meteor.setTimeout(() => {
      this.$(".tooltip-icon").tooltip({
        delay: 50,
      });
      this.$(".tooltipped").tooltip({
        delay: 50,
      });
      Materialize.updateTextFields();
    }, 1000);
  });
});

Template.events_meeting_manage_delete.events({
  "click .btnModalDelete"() {
    let meetingId = deleteId.get();
    deleteZoomMeeting.call(meetingId, (err) => {
      if (err) {
        showError(err);
      } else {
        deleteEventMeeting.call(meetingId, (err) => {
          if (err) {
            showError(err);
          }
          deleteModal.modal("close");
          showSuccess(`Meeting deleted.`);
        });
      }
    });
  },
});

Template.addmeetingForm.onCreated(function () {
  this.editing = new ReactiveVar(false);
  this.showList = new ReactiveVar(false);
  const eventId = FlowRouter.getParam("id");
  fetchGuestList.call(
    {
      eventId,
      type: "all_guest",
    },
    (err, res) => {
      pageReady.set(true);
      if (err) console.log(err);
      else {
        console.log("guestList", res);
        Session.set("guestList", res);
      }
    }
  );
});

async function fetchMeeting() {
  const searchQuery = {
    eventId: FlowRouter.getParam("id"),
    meetingId: parseInt(FlowRouter.getParam("meetingId")),
  };
  const meeting = await Event_Meetings.find(searchQuery).fetch();

  const inviteGuestList =
    (await meeting) && meeting[0] && meeting[0].inviteGuestList;
  if (inviteGuestList && inviteGuestList.length > 0) {
    console.log("inviteGuestList", inviteGuestList);
    Session.set("selectedGuestIds", inviteGuestList);
  } else {
    let list = [];
    Session.set("selectedGuestIds", list);
  }

  const listType = (await meeting) && meeting[0] && meeting[0].listType;

  if (listType) {
    this.$(`.selectGuestListType input#${listType}`).prop("checked", true);
    showGuests.set(true);
  } else {
    showGuests.set(false);
  }
}

Template.addmeetingForm.onRendered(function () {
  this.subscribe("event_meetings.event", FlowRouter.getParam("id"));
  this.subscribe(
    "event_meetings.info",
    FlowRouter.getParam("id"),
    FlowRouter.getParam("meetingId")
  );
  this.subscribe("guests.all", FlowRouter.getParam("id"));

  const currentRoute = FlowRouter.getRouteName();
  let selectedGuests;
  if (currentRoute === "editEventMeeting") {
    this.editing.set(true);
    this.showList.set(true);
    fetchMeeting();
    if (Session.get("selectedGuestIds")) {
      selectedGuests = _.clone(Session.get("selectedGuestIds"));
    } else {
      selectedGuests = [];
    }
  } else {
    this.editing.set(false);
    this.showList.set(false);
    selectedGuests = [];
  }
  Session.set("selectedGuestIds", selectedGuests);
  if (Session.get("guestList").length < 0) {
    fetchGuestList.call(
      {
        eventid: FlowRouter.getParam("id"),
        type: "",
      },
      (err, res) => {
        pageReady.set(true);
        if (err) console.log(err);
        else {
          Session.set("guestList", res);
        }
      }
    );
  }
  this.autorun(() => {
    Meteor.setTimeout(() => {
      this.$(".tooltip-icon").tooltip({
        delay: 50,
      });
      this.$(".tooltipped").tooltip({
        delay: 50,
      });
      this.$(".modal").modal();
      Materialize.updateTextFields();
    }, 1000);
  });
});

Template.addmeetingForm.helpers({
  title: () => {
    return Template.instance().editing.get() ? "Edit Meeting" : "Add Meeting";
  },
  meetingInfo: () => {
    const searchQuery = {
      eventId: FlowRouter.getParam("id"),
      meetingId: parseInt(FlowRouter.getParam("meetingId")),
    };
    const eventMeeting = Event_Meetings.findOne(searchQuery);
    return Template.instance().editing.get() ? eventMeeting : "";
  },
  hasGuests: () => {
    return Session.get("guestResult") && Session.get("guestResult").length > 0
      ? true
      : false;
  },
  showGuests: () => {
    return showGuests.get();
  },
});

Template.addmeetingForm.events({
  "submit #meetingForm"(event, template) {
    event.preventDefault();
    const eventId = FlowRouter.getParam("id");
    const meetingId = FlowRouter.getParam("meetingId");
    let templatedata = template.$(event.target).serializeObject();
    console.log(
      "testts",
      template.$(event.target).serializeObject(),
      templatedata
    );
    const isEdit = template.editing.get();

    if (isEdit) {
      templatedata.meetingId = meetingId;
      if (Session.get("selectedGuestIds")) {
        templatedata.inviteGuestList = _.clone(Session.get("selectedGuestIds"));
      }
      if (!templatedata.inviteGuestList) {
        templatedata.inviteGuestList = [];
      }

      const meetingdata = {
        meetingId: parseInt(meetingId),
        topic: templatedata.topic,
        start_time: new Date(templatedata.start_time),
        duration: parseInt(templatedata.duration),
        password: templatedata.password,
        agenda: templatedata.agenda,
      };

      updateZoomMeeting.call(meetingdata, (err) => {
        if (err) {
          showError(err);
        } else {
          const updateEventMeetingData = {
            ...meetingdata,
            inviteGuestList: templatedata.inviteGuestList,
            start_time: `${meetingdata.start_time}`,
            listType: templatedata.guestGroup,
            eventId: FlowRouter.getParam("id"),
          };
          updateEventMeeting.call(updateEventMeetingData, (err) => {
            if (err) {
              showError(err);
            } else {
              FlowRouter.go("events.meetings", {
                id: eventId,
              });
              showSuccess("Update Event Meeting");
            }
          });
        }
      });
    } else {
      if (Session.get("selectedGuestIds")) {
        templatedata.inviteGuestList = _.clone(Session.get("selectedGuestIds"));
      }
      if (!templatedata.inviteGuestList) {
        templatedata.inviteGuestList = [];
      }

      const meetingdata = {
        topic: templatedata.topic,
        start_time: new Date(templatedata.start_time),
        duration: templatedata.duration,
        password: templatedata.password,
        agenda: templatedata.agenda,
        type: 2,
        settings: {
          //   host_video: false,
          //   in_meeting: false,
          join_before_host: false,
          //   mute_upon_entry: false,
          participant_video: false,
          //   registrants_confirmation_email: true,
          //   use_pmi: false,
          waiting_room: false,
          //   watermark: false,
          approval_type: 0,
          //   alternative_hosts: "",
          //   global_dial_in_countries: [
          //     {
          //       city: "",
          //       country: "",
          //       country_name: "",
          //       number: "",
          //       type: "",
          //     },
          //   ],
        },
      };
      createZoomMeeting.call(meetingdata, (err, res) => {
        console.log("createZoomMeeting", err, res);
        if (err) {
          showError(err);
        } else {
          if (res.statusCode === 201) {
            const insertEventMeetingData = {
              meetingId: res.data.id,
              inviteGuestList: templatedata.inviteGuestList,
              host_id: res.data.host_id,
              host_email: res.data.host_email,
              topic: res.data.topic,
              type: 2,
              typeTitle: "Scheduled meeting.",
              start_time: `${meetingdata.start_time}`,
              status: res.data.status,
              timezone: res.data.timezone,
              agenda: res.data.agenda,
              created_at: res.data.created_at,
              start_url: res.data.start_url,
              join_url: res.data.join_url,
              password: res.data.password,
              eventId: eventId,
              duration: parseInt(meetingdata.duration),
              removed: false,
              listType: templatedata.guestGroup,
              invitationSentStatus: 0,
              activateMeeting: false,
            };
            insertEventMeeting.call(insertEventMeetingData, (err) => {
              if (err) {
                showError(err);
              } else {
                FlowRouter.go("events.meetings", {
                  id: eventId,
                });
                showSuccess("Add Event Meeting");
              }
            });
          }
        }
      });
    }
  },

  'change .selectGuestListType input[name="listType"]'(event, template) {
    event.preventDefault();
    template.showList.set(true);
    if (event.target.value === "guest") {
      showGuests.set(true);
    } else {
      showGuests.set(false);
    }
  },
});
