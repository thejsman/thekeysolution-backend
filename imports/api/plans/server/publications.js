

import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/meteor-roles';
import { Plans } from '../plans.js';

Meteor.publish('plans.all', function(id) {
  return Plans.find({});
});

Meteor.publish('plans.one', function(id) {
  return Plans.find(id);
});

Meteor.publish('plans.one.feature', function(id) {
  return Plans.find({_id:id,planIsStatusInactive: false},{fields:{planFeatures:true}});
});

Meteor.publish('plans.sort', function(id) {
	return Plans.find({});
});

Meteor.publish('plans.subscription', function(id) {
  return Plans.find({planIsStatusInactive: false});
});

