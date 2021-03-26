import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Events } from "../../api/events/events";
import { SpeakerSchema } from "./schema.js";
import { Speakers } from "./speakers";
import { Roles } from "meteor/meteor-roles";
import { insertActivity } from "../../api/activity_record/methods.js";

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
    activityeDateTime: date, //date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+'.'+date.getMilliseconds(),
    activityUserInfo: activityUserInfo,
    activityModule: data.activityModule,
    activitySubModule: data.activitySubModule,
    activityEvent: activityEvent,
    activityMessage: data.activityMessage,
  };
  insertActivity.call(userdata, (err, res) => {
    if (err) {
      console.log("Insert Activity record Error :: ", err);
      return 0;
    } else {
      return true;
    }
  });
}

export const insertSpeaker = new ValidatedMethod({
  name: "Speakers.methods.insert",
  validate: SpeakerSchema.validator({
    clean: true,
  }),
  run(speakerNew) {
    var event = Events.findOne({
      _id: speakerNew.eventId,
    });

    if (event) {
      Speakers.insert(speakerNew);
    } else {
      throw new Meteor.Error("Event Id Invalid");
    }
  },
});

export const updateSpeaker = new ValidatedMethod({
  name: "Speakers.methods.update",
  validate: SpeakerSchema.validator({
    clean: true,
  }),
  run(speakerUpdate) {
    if (!isAllowed(this.userId, "edit-speaker")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    } else {
      Speakers.update(speakerUpdate.speakerId, {
        $set: speakerUpdate,
      });
    }
  },
});

export const deleteSpeaker = new ValidatedMethod({
  name: "Speakers.methods.delete",
  validate: null,
  run(id) {
    if (!isAllowed(this.userId, "delete-speaker")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    let speakers = Speakers.find({
      _id: id,
    });
    let user = Meteor.user();
    Speakers.remove(id);
    var activityInsertData = {
      eventId: speakers.eventId,
      activityModule: "Guests",
      activitySubModule: "Speakers",
      event: "delete",
      activityMessage:
        "Speaker is deleted by " + user.profile.name + ", userId: " + user._id,
    };
    activityRecordInsert(activityInsertData);
  },
});
