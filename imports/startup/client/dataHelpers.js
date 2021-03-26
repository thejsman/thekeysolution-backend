// Time-stamp: 2017-08-25
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : dataHelpers.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { EventTypesDisplayName } from '../../api/events/eventTypes.js';
import { Roles } from 'meteor/meteor-roles';
import { Agencies } from '../../api/agencies/agencies.js';
import moment from 'moment';

Template.registerHelper('getEventType', (type) => {
  return EventTypesDisplayName[type];
});

Template.registerHelper('getDuration', (start, end) => {
  return start + ' - ' + end;
});

Template.registerHelper('parseBool', (b) => {
  return b ? "Yes" : "No";
});

Template.registerHelper('parseTime', (time) => {
  if(time) return moment(time).format('LLL');
  return "";
});

Template.registerHelper('isAllowed', (role) => {
  let userId = Meteor.userId();
  let agency = Agencies.find();
  let scopes = Roles.getScopesForUser(userId);
  if(scopes.length > 0) {
    for(var i = 0; i < scopes.length; i++) {
      if(Roles.userIsInRole(userId, role, scopes[i])) {
	return true;
      }
    }
    return false;
  }
  else {
    return Roles.userIsInRole(userId, role);
  }
});

Template.registerHelper('parseDateTime', (datetime) => {
  if(datetime) return moment(datetime).format('LLL');
  return "";
});

Template.registerHelper('parseDateForFlight', (date) => {
  if(date) return moment(date).format('YYYY/MM/DD');
  return "";
});

Template.registerHelper('isEqual', function(v1, v2) {
  if (v1 === v2) {
    return true
  } else {
    return false
  }
});