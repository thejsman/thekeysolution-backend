import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { EventMeetingSchema } from "./schema.js";
import { Events } from "../events/events.js";
import { Event_Meetings } from "./event_meetings.js";
import { HTTP } from "meteor/http";

const zoomBaseURL = "https://api.zoom.us/v2";
const meetingURL = `${zoomBaseURL}/meetings`;
const token =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdWQiOm51bGwsImlzcyI6IjNYV0dieFJ5UWw2SmtMeFdFQzVLLXciLCJleHAiOjE2MTEwNjk5MDEsImlhdCI6MTYxMDQ2NTEwMn0.glb95xpTJWCd5MITsgRNwDPkGPBSH_TC2a2qM-Znc40";
let options = {
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "https://api.zoom.us",
    authorization: `Bearer ${token}`,
  },
  crossDomain: true,
  processData: false,
};

export const insertEventMeeting = new ValidatedMethod({
  name: "Event_Meetings.methods.insert",
  validate: EventMeetingSchema.validator(),
  run(meetingNew) {
    var event = Events.findOne({
      _id: meetingNew.eventId,
    });
    if (event) {
      return Event_Meetings.insert(meetingNew);
    } else {
      throw new Meteor.Error("Event Id Invalid");
    }
  },
});

export const updateEventMeeting = new ValidatedMethod({
  name: "Event_Meetings.methods.update",
  validate: EventMeetingSchema.validator(),
  run(eventMeetingUpdate) {
    Event_Meetings.update(
      { meetingId: eventMeetingUpdate.meetingId },
      {
        $set: eventMeetingUpdate,
      },
      { upsert: true }
    );
  },
});

export const activateEventMeeting = new ValidatedMethod({
  name: "Event_Meetings.methods.activateEventMeeting",
  validate: null,
  run(obj) {
    Event_Meetings.update(
      { _id: obj._id },
      {
        $set: {
          activateMeeting: obj.activateMeeting,
          status: obj.status,
        },
      },
      { upsert: true }
    );
  },
});

export const updateEventMeetingStatus = new ValidatedMethod({
  name: "Event_Meetings.methods.updatestatus",
  validate: null,
  run(obj) {
    Event_Meetings.update(
      { _id: obj._id },
      {
        $set: {
          status: obj.status,
        },
      },
      { upsert: true }
    );
  },
});

export const deleteEventMeeting = new ValidatedMethod({
  name: "Event_Meetings.methods.delete",
  validate: null,
  run(meetingId) {
    Event_Meetings.update(
      {
        meetingId,
      },
      {
        $set: {
          removed: true,
        },
      }
    );
  },
});

export const createZoomMeeting = new ValidatedMethod({
  name: "zoom.methods.createMeeting",
  validate: null,
  run(data) {
    const url = `${zoomBaseURL}/users/niranjan.bhambi@gmail.com/meetings`;
    options = { ...options, data };
    var convertAsyncToSync = Meteor.wrapAsync(HTTP.post),
      resultOfAsyncToSync = convertAsyncToSync(url, options);
    return resultOfAsyncToSync;
  },
});

export const updateZoomMeeting = new ValidatedMethod({
  name: "zoom.methods.updateMeeting",
  validate: null,
  run(data) {
    const url = `${meetingURL}/${data.meetingId}`;
    options = {
      ...options,
      data: data,
    };
    //  var convertAsyncToSync = Meteor.wrapAsync(HTTP.patch),
    //    resultOfAsyncToSync = convertAsyncToSync(url, options);
    //  return resultOfAsyncToSync;

    HTTP.call("patch", url, options, (error, result) => {
      if (error) {
        throw error;
      }
      return result;
    });
  },
});

export const deleteZoomMeeting = new ValidatedMethod({
  name: "zoom.methods.deleteMeeting",
  validate: null,
  run(meetingId) {
    const url = `${meetingURL}/${meetingId}?cancel_meeting_reminder=true&schedule_for_reminder=true`;
    var convertAsyncToSync = Meteor.wrapAsync(HTTP.del),
      resultOfAsyncToSync = convertAsyncToSync(url, options);
    return resultOfAsyncToSync;
  },
});

//https://api.zoom.us/v2/meetings/{meetingId}/registrants
export const addZoomMeetingRegistrants = new ValidatedMethod({
  name: "zoom.methods.addRegistrants",
  validate: null,
  run(data) {
    const url = `${meetingURL}/${data.meetingId}/registrants`;
    options = { ...options, data };
    var convertAsyncToSync = Meteor.wrapAsync(HTTP.del),
      resultOfAsyncToSync = convertAsyncToSync(url, options);
    return resultOfAsyncToSync;
  },
});
