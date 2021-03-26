// Time-stamp: 2017-07-29 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';

export const FoodSchema = new SimpleSchema({
	foodId: {
    type: String,
    optional: true
  },
  eventId: { type: String },
  foodSectionStatement: { type: String},
  foodOption1: { type: String },
  foodOption2: { type: String },
  foodOption3: { type: String },
  foodRemark: { type: String },
});


export const FoodBookingSchema = new SimpleSchema({
  eventId: String,
  foodId: {type:String, optional:true},
  foodRemark: { type: String, optional:true },
  foodOption: { type: String, optional:true },
  guestId: String,
});
