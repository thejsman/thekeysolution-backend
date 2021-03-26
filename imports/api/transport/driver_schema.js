// Time-stamp: 2017-07-28 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : driver_schema.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------

import SimpleSchema from 'simpl-schema';

export const TransportDriverSchema = new SimpleSchema({
	driverId: {
    type: String,
    optional: true
  },
  eventId: { type: String },
  driverName: { type: String },
  driverContact: { type: String },
  driverRemarks: { type: String, optional: true }
});

export const TransportDriverSchemaStrict = new SimpleSchema({
  driverId: { type: String },
  eventId: { type: String },
  driverName: { type: String },
  driverContact: { type: String }
});


export const DriverBookingSchema = new SimpleSchema({
  eventId: String,
  driverId: {type:String, optional:true},
  guestId: String,
});
