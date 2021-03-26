import { Meteor } from 'meteor/meteor';
import { SubEvents } from '../subevents.js';

Meteor.publish('subevents.event', function(id) {
  return SubEvents.find({
    eventId: id
  });
});
