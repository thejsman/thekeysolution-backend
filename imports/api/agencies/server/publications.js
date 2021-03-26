// Time-stamp: 2017-08-13
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/meteor-roles';
import { Agencies } from '../agencies.js';
import { Events } from '../../events/events.js';
import _ from 'lodash';

Meteor.publish('admin.agency.list', function() {
  var canViewList = Roles.userIsInRole(this.userId,'agency-list');
  var scopes = Roles.getScopesForUser(this.userId);
  if(canViewList) {
    return [Agencies.find(), Events.find({}, { fields: { _id: 1, basicDetails: 1, appRequested: 1}}), Meteor.users.find({}, {
      fields: { _id: 1 , roles: 1}
    })];
  }
  else if (scopes.length > 0){

    var agencies = [];
    var self = this;
    _.each(scopes, (scope) => {
      if(Roles.userIsInRole(self.userId,'admin', scope)) {
	agencies.push(scope);
      }
    });
    return [Agencies.find({
      _id: {
	$in: agencies
      }
    })];
  }
  else {
    return null;
  }
});

Meteor.publish('agency.one', function(id) {
  return Agencies.findOne(id);
});
