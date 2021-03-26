import { Meteor } from 'meteor/meteor';
import { Speakers } from '../speakers.js';

Meteor.publish('speakers.event', function(id) {
  return Speakers.find({
    eventId: id
  });
});

Meteor.publish('speakers.item', function(id) {
  return Speakers.find({
    _id: id
  });
});