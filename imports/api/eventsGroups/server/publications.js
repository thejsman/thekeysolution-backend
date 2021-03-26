import { Meteor } from 'meteor/meteor';
import { EventsGroups } from '../eventsGroups';

Meteor.publish('eventsGroups.list', function(id) {
  return EventsGroups.find({
    _id: id
  });
});