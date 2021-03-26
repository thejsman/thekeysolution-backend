// Time-stamp: 2017-07-29
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';

export const AssistanceSchema = new SimpleSchema({
	assistanceId: {
    type: String,
    optional: true
  },
  eventId: { type: String },
  assistanceSectionStatement: { type: String},
  assistanceOption1: { type: String },
  assistanceOption2: { type: String },
  assistanceOption3: { type: String },
  assistanceRemark: { type: String },
});


export const AssistanceBookingSchema = new SimpleSchema({
  eventId: String,
  assistanceId: {type:String, optional:true},
  guestId: String,
});
