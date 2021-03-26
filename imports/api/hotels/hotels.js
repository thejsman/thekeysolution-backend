// Time-stamp: 2017-06-22
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : hotels.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import { Mongo } from 'meteor/mongo';
import { HotelBookings } from './hotelBookings.js';

export const Hotels = new Mongo.Collection('hotels');

Hotels.before.remove((userId, doc) => {
  let hotelId = doc._id;
  HotelBookings.remove({ hotelId });
});
