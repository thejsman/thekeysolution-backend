// Time-stamp: 2017-10-10 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';

export const RSVPSubEventSchema = new SimpleSchema({
  'subEventId': String,
  'status': SimpleSchema.oneOf(String, Boolean)
});

export const InviteGuestSchema = new SimpleSchema({
  'guestId': String,
  'subevents': { type: Array, minCount: 1 },
  'subevents.$': { type: RSVPSubEventSchema }
});

export const RSVPSchema = new SimpleSchema({
  eventId: String,
  guestId: String,
  subevents: {
    type: Array,
    minCount: 1
  },

  'subevents.$': {
    type: RSVPSubEventSchema
  }
});
