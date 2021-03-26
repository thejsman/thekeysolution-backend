import { Meteor } from 'meteor/meteor';
import { Downloads } from '../download.js';

Meteor.publish('event.downloads', function(id) {
  return Downloads.find({
    eventId: id
  });
});

Meteor.publish('one.download', function(id) {
  return Downloads.find({
    _id: id
  });
});