// Time-stamp: 2017-06-22
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { Flightsforsale } from '../flightsforsale.js';
import { FlightforsaleBookings } from '../flightforsaleBookings.js';

Meteor.publish('flightsforsale.all', function(id) {
  return Flightsforsale.find({
    eventId: id
  });
});
Meteor.publish('flightforsale.bookings.guest', function(id) {
  return FlightforsaleBookings.find({
    guestId: id
  });
});
Meteor.publish('flightforsale.bookings.total', function() {
  return FlightforsaleBookings.find();
});

Meteor.publish('flightsforsale.one', function(id) {
  return Flightsforsale.find(id);
});
