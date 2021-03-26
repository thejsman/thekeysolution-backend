import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/meteor-roles';
import { Modules } from '../modules.js';

Meteor.publish('modules.all', function(id) {
  return Modules.find({});
});

Meteor.publish('modules.one', function(id) {
  return Modules.find(id);
});

Meteor.publish('modules.sort', function(id) {
	return Modules.find({});
});

