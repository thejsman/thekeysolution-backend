// Time-stamp: 2017-07-29 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { RoomBookings } from '../roomBooking.js';


Meteor.publish('roombookings.all', function(eventId) {
  return RoomBookings.find({
    eventId: eventId
  });
});