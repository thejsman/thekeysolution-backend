// Time-stamp: 2017-07-29 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { Visas } from '../visas.js';
import { VisaBookings } from '../visaBooking.js';

Meteor.publish('visas.event', function(id) {
  return Visas.find({
    eventId: id
  });
});


Meteor.publish('visabookings.all', function(eventId) {
  return VisaBookings.find({
    eventId: eventId
  });
});