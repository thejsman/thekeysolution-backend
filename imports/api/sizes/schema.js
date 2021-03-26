// Time-stamp: 2017-07-29
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';

export const SizeSchema = new SimpleSchema({
	sizeId: {
    type: String,
    optional: true
  },
  eventId: { type: String },
  sizeSectionStatement: { type: String},
  sizeOption1: { type: String },
  sizeOption2: { type: String },
  sizeOption3: { type: String },
  sizeRemark: { type: String },
});


export const SizeBookingSchema = new SimpleSchema({
  eventId: String,
  sizeId: {type:String, optional:true},
  guestId: String,
});
