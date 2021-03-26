// Time-stamp: 2017-07-29 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';

export const PassportSchema = new SimpleSchema({
	passportId: {
    type: String,
    optional: true
  },
  eventId: { type: String },
});


export const PassportBookingSchema = new SimpleSchema({
  eventId: String,
  passportId: {type:String, optional:true},
  guestId: String,
  guestNationality:{type:String, optional:true},
  guestPassportNumber:{type:String, optional:true},
  guestDOB:{type:String, optional:true},
  guestpassportissue:{type:String, optional:true},
  guestpassportissuedate:{type:String, optional:true},
  guestpassportaddress:{type:String, optional:true},
  guestpassportexpiry:{type:String, optional:true},
  guestPhotoID : {type:String},
});
