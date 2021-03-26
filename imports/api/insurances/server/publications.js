// Time-stamp: 2017-07-29 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { Insurances } from '../insurances.js';
import { InsuranceBookings } from '../insuranceBooking.js';

Meteor.publish('insurances.event', function(id) {
  return InsuranceBookings.find({
    eventId: id
  });
});


Meteor.publish('insurancebookings.all', function(eventId) {
  return InsuranceBookings.find({
    eventId: eventId
  });
});