// import { Meteor } from 'meteor/meteor';
// import { Guests } from '../../guests/guests.js';
// import { Event_Meetings } from '../event_meetings.js';

// Meteor.publish('event_meetings.event', function(id) {
//   return Event_Meetings.find({
//     eventId: id
//   });
// });

// Meteor.publish('event_meetings.info', function(id) {
//   return Event_Meetings.find({
//     _id: id
//   });
// });

// Meteor.publish('event_meetings.guest', function(id) {
//   return Guests.find({
//     eventId: id
//   });
// });

// // Meteor.publish('event_meetings.item', function(id) {
// //   return Event_Meetings.find({
// //     _id: id
// //   });
// // });