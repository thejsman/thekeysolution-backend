// Time-stamp: 2017-07-29
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { Sizes } from '../sizes.js';
import { SizeBookings } from '../sizeBooking.js';

Meteor.publish('sizes.event', function(id) {
  return Sizes.find({
    eventId: id
  });
});


Meteor.publish('sizebookings.all', function(eventId) {
  return SizeBookings.find({
    eventId: eventId
  });
});
