// Time-stamp: 2017-07-29 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { Passports } from '../passports.js';
import { PassportBookings } from '../passportBooking.js';

Meteor.publish('passports.event', function(id) {
  return Passports.find({
    eventId: id
  });
});


Meteor.publish('passportbookings.all', function(eventId) {
  return PassportBookings.find({
    eventId: eventId
  });
});