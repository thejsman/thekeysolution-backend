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
import { AdminInvitations } from '../invitations.js';
import _ from 'lodash';
import { Agencies } from '../../agencies/agencies.js';

let otherRoles = ['admin', 'client', 'freelancer', 'member'];

Meteor.publish('admin.agency', function() {
  let scopes = Roles.getScopesForUser(this.userId);
  if(scopes.length > 0) {
    return Agencies.find({
      _id: {
	$in: scopes
      }
    });
  }
});

Meteor.publish('admin.agency.invitations', function() {
  if(Roles.userIsInRole(this.userId, 'view-agency-invitations')) {
    return AdminInvitations.find({
      type: 'agency'
    });
  }
  else {
    return null;
  }
});

Meteor.publish('admin.user.invitations', function() {
  var scopes = Roles.getScopesForUser(this.userId);
  var self = this;
  if(scopes.length > 0) {
    var agencies = [];
    _.each(scopes, scope => {
      if(Roles.userIsInRole(self.userId, 'view-user-invitations', scope)) {
	agencies.push(scope);
      }
    });
    return AdminInvitations.find({
      agency: {
	$in: agencies
      },
      role: {
	$in: otherRoles
      }
    });
  }
  else if(Roles.userIsInRole(this.userId, 'view-user-invitations')){
    return AdminInvitations.find({
      role: {
	$in: otherRoles
      }
    });
  }
  else {
    return null;
  }
});

Meteor.publish('admin.user.joined', function() {
    var scopes = Roles.getScopesForUser(this.userId);
  var self = this;
  if(scopes.length > 0) {
    var agencies = [];
    _.each(scopes, scope => {
      if(Roles.userIsInRole(self.userId, 'user-list', scope)) {
	agencies.push(scope);
      }
    });
    return Meteor.users.find({
      "roles.scope": {
	$in: agencies
      },
      "roles._id": {
	$in: otherRoles
      }
    }, {
      fields: {
	emails: true,
	roles: true,
	profile: true,
	allowedEvents: true
    }});
  }
  else if(Roles.userIsInRole(this.userId, 'user-list')){
    return Meteor.users.find({
      "roles._id": {
	$in: otherRoles
      }
    }, {
      fields: {
	emails: true,
	roles: true,
	profile: true,
	allowedEvents: true
    }});
  }
  else {
    return null;
  }
});

Meteor.publish('admin.invite', function(token) {
  // for the invite page, do not secure
  return AdminInvitations.find({
    token: token
  }, {
    fields: {
      email: 1,
      name: 1
    }
  });
});
