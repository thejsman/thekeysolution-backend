// Time-stamp: 2017-07-29 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';

export const VisaSchema = new SimpleSchema({
	visaId: {
    type: String,
    optional: true
  },
  eventId: { type: String },
});


export const VisaBookingSchema = new SimpleSchema({
  eventId: String,
  visaId: {type:String, optional:true},
  guestId: String,
  guestValidVisa:{type:String, optional:true},
  guestCountryIssue:{type:String, optional:true},
  guestTypeOfVisa:{type:String, optional:true},
  guestVisaNumber:{type:String, optional:true},
  guestValidFrom:{type:String, optional:true},
  gestValidTill:{type:String, optional:true},
  guestVisaScan:{type:String, optional:true},
});
