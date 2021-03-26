// Time-stamp: 2017-07-28 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { AirportManager } from '../airportmanager.js';
import { HospitalityManager } from '../hospitalitymanager.js';
import { AirportManagerBooking } from '../airportmanagerBooking.js';
import { HospitalityManagerBooking } from '../hospitalitymanagerBooking.js';

Meteor.publish('airman.event', function(id) {
  return AirportManager.find({
    eventId: id
  });
});

Meteor.publish('hosman.event', function(id) {
  return HospitalityManager.find({
    eventId: id
  });
});

Meteor.publish('airmanbooking.all', function(eventId) {
  return AirportManagerBooking.find({
    eventId: eventId
  });
});

Meteor.publish('hosmanbooking.all', function(eventId) {
  return HospitalityManagerBooking.find({
    eventId: eventId
  });
});