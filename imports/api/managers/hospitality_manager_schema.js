// Time-stamp: 2017-07-28 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : vehicle_schema.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';

export const HospitalityManagerSchema = new SimpleSchema({
  managerId: { type: String, optional: true },
  eventId: { type: String },
  hospitalityManagerName: { type: String },
  hospitalityManagerNo: { type: String },
  hospitalityManagerLocation: { type: String }
});



export const HospitalityManagerBookingSchema = new SimpleSchema({
  eventId: String,
  MId: {type:String, optional:true},
  guestId: String,
});
