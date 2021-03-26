// Time-stamp: 2017-07-29 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';

export const GiftSchema = new SimpleSchema({
  giftId: {
    type: String,
    optional: true
  },
  eventId: { type: String },
  giftName: { type: String},
  giftQuantity: { type: SimpleSchema.Integer }
});


export const GiftBookingSchema = new SimpleSchema({
  bookingId: {
    type: String, optional: true
  },
  eventId: String,
  giftId: {type:String, optional:true},
  guestId: String,
  giftDate:{type:String, optional:true},
  giftTime:{type:String, optional:true},
  giftRemarks:{type:String,optional:true},
  giftNo: { type: SimpleSchema.Integer, defaultValue: 1, min: 1 }
});
