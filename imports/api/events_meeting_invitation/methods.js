import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Event_Meeting_Guest_Invitation } from "./events_meeting_invitation.js";
import { Event_Meetings } from "../events_meeting/event_meetings.js";

// validate: EventMeetingSchema.validator({
//   clean: true,
// }),

export const insertEventMeetingGuestInvitation = new ValidatedMethod({
  name: "Event_Meeting_Guest_Invitation.methods.insert",
  validate: null,
  run(objData) {
    var eventmeeting = Event_Meetings.findOne({
      _id: objData.eventmeeting,
    });
    if (eventmeeting) {
      return Event_Meeting_Guest_Invitation.insert(objData);
    } else {
      throw new Meteor.Error("Event Id Invalid");
    }
  },
});
