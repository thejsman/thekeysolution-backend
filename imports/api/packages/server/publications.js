import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/meteor-roles';
import { Packages } from '../packages.js';

Meteor.publish('packages.all', function(id) {
  return Packages.find({});
});
