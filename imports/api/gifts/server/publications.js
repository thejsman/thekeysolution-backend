// Time-stamp: 2017-07-29 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { Gifts } from '../gifts.js';
import { GiftBookings } from '../giftBooking.js';

Meteor.publish('gifts.event', function(id) {
  return Gifts.find({
    eventId: id
  });
});


Meteor.publish('giftbookings.all', function(eventId) {
  return GiftBookings.find({
    eventId: eventId
  });
});