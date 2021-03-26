

import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/meteor-roles';
import { Features } from '../features.js';

Meteor.publish('features.all', function(id) {
  return Features.find({});
});

Meteor.publish('features.subscription', function(scopes) {
	console.log('scopes',scopes);
  return Features.find({
  	_id:scopes
  });
}); 
 
