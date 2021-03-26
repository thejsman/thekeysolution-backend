// Time-stamp: 2017-07-29 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { Foods } from '../foods.js';
import { FoodBookings } from '../foodBooking.js';

Meteor.publish('foods.event', function(id) {
  return Foods.find({
    eventId: id
  });
});


Meteor.publish('foodbookings.all', function(eventId) {
  return FoodBookings.find({
    eventId: eventId
  });
});