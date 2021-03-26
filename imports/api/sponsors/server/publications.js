import { Meteor } from 'meteor/meteor';
import { Sponsors } from '../sponsors.js';

Meteor.publish('sponsors.event', function(id) {
  return Sponsors.find({
    eventId: id
  });
});

Meteor.publish('sponsors.item', function(id) {
  return Sponsors.find({
    _id: id
  });
});