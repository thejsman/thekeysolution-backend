// Time-stamp: 2017-07-29 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';

export const InsuranceSchema = new SimpleSchema({
	insuranceId: {
    type: String,
    optional: true
  },
  eventId: { type: String },
});


export const InsuranceBookingSchema = new SimpleSchema({
  eventId: String,
  insuranceId: {type:String, optional:true},
  guestId: String,
  guestValidInsurance:{type:String, optional:true},
  guestInsuranceIssuedBy:{type:String, optional:true},
  guestPolicy:{type:String, optional:true},
  guestinsurancevalidfrom:{type:String, optional:true},
  guestvalidtill:{type:String, optional:true},
  guestinsurancescan:{type:String, optional:true},
});
