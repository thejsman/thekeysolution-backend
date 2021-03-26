import { Meteor } from "meteor/meteor";
import { Guests } from "../../guests/guests.js";
import { Event_Meetings } from "../event_meetings.js";

Meteor.publish("event_meetings.event", function (eventId) {
  return Event_Meetings.find({
    eventId,
  });
});

Meteor.publish("event_meetings.info", function (eventId, meetingId) {
  return Event_Meetings.find({ eventId, meetingId });
});

Meteor.publish("event_meetings.guest", function (id) {
  return Guests.find({
    eventId: id,
  });
});

// Meteor.publish('event_meetings.item', function(id) {
//   return Event_Meetings.find({
//     _id: id
//   });
// });
