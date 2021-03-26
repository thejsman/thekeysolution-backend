// Time-stamp: 2017-07-29 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';

export const RoomSchema = new SimpleSchema({
	roomId: {
    type: String,
    optional: true
  },
  eventId: { type: String },
  roomSectionStatement: { type: String},
  roomOption1: { type: String },
  roomOption2: { type: String },
  roomOption3: { type: String },
  roomRemark: { type: String },
});


export const RoomBookingSchema = new SimpleSchema({
  eventId: String,
  roomId: {type:String, optional:true},
  roomRemark: { type: String, optional:true },
  roomOption: { type: String, optional:true },
  guestId: String,
});
