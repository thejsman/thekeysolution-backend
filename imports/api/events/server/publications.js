// Time-stamp: 2017-06-14
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { Events } from '../events.js';
import { Agencies } from '../../agencies/agencies.js';
import { Roles } from 'meteor/meteor-roles';

Meteor.publish('events.all', function() {
  let agencies = Roles.getScopesForUser(this.userId);
  let agency = agencies[0];
  if(Roles.userIsInRole(this.userId, 'view-events-list', agency)) {
    var scopes = agencies;
    let user = Meteor.users.findOne(this.userId);
    let search = {
      "removed": {
	$ne: true
      }
    }
    if(user.allowedEvents && user.allowedEvents.length > 0) {
      search = {
	...search,
	_id: {
	  $in: user.allowedEvents
	}
      };
    }
    if(scopes.length > 0) {
      search = {
	...search,
	"basicDetails.agency": {
	  $in: scopes
	}
      };
      return [Events.find(search), Agencies.find({ _id: {
	$in: agencies
      }})];
    }
    else {
      return [Events.find(search), Agencies.find()];
    }
  }
  else {
    return null;
  }
});

Meteor.publish('events.one', function(id) {
  return Events.find({
    _id: id
  });
});
