import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/meteor-roles';
import { EventPackages, EventPackageInfo } from '../event_packages.js';

Meteor.publish('packages.event', function(id) {
  return EventPackages.find({eventId : id});
});

Meteor.publish('packages.event.info', function(id) {
  return EventPackageInfo.find({eventId : id});
});