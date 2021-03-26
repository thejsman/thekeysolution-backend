// Time-stamp: 2017-06-20
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : flights.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import { Mongo } from 'meteor/mongo';
import { FlightforsaleBookings } from './flightforsaleBookings.js';

export const Flightsforsale = new Mongo.Collection('flightsforsale');

Flightsforsale.before.remove((userId, doc) => {
  let flightId = doc._id;
  FlightforsaleBookings.remove({ flightId });
});
