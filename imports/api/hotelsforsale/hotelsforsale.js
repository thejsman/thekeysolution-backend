// Time-stamp: 2017-06-22
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : hotels.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import { Mongo } from 'meteor/mongo';
import { HotelforsaleBookings } from './hotelforsaleBookings.js';

export const Hotelsforsale = new Mongo.Collection('hotelsforsale');

Hotelsforsale.before.remove((userId, doc) => {
  let hotelId = doc._id;
  HotelforsaleBookings.remove({ hotelId });
});
