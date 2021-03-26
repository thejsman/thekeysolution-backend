// Time-stamp: 2017-06-22
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';

export const HotelforsaleRoomUpdateSchema = new SimpleSchema({
  bookingId: String,
  roomNumber: String,
  hotelRoomId: String
});

export const HotelforsaleRoomRemarksUpdateSchema = new SimpleSchema({
  bookingId: String,
  roomRemarks: String,
  hotelRoomId: String
});

export const HotelforsaleRoomSchema = new SimpleSchema({
  hotelRoomId: { type: String, optional: true },
  hotelId: String,
  eventId: String,
  hotelRoomCategory: String,
  hotelRoomType: {type:String, optional:true},
  hotelRoomMaxOccupants: {type: SimpleSchema.Integer, min : 1},
  hotelRoomTotal: {type: SimpleSchema.Integer, min : 1},
  hotelRoomBedType: {type: String},
  hotelRoomCost: {type: SimpleSchema.Integer},
  hotelRoomIsSmoking: {type: Boolean, defaultValue:false},
  hotelRoomIsAdjoining: {type: Boolean, defaultValue:false},
  hotelRoomIsConnecting: {type: Boolean, defaultValue:false},
  hotelRoomFrom: { type: String },
  hotelRoomTo : { type: String },
  hotelRoomRemarks : { type: String, optional:true}
});

export const HotelforsaleSchema = new SimpleSchema({
  eventId: { type : String },
  hotelId: { type: String, optional: true },
  hotelName: { type: String },
  hotelContactName : { type: String },
  hotelContactDesignation : { type: String },
  hotelContactPhone : { type: String },
  hotelType: String,
  hotelRating: String,
  hotelAddress1: {type: String, optional: true},
  hotelAddress2: {type: String, optional: true},
  hotelAddressCity: {type: String, optional: true},
  hotelAddressState: {type: String, optional: true},
  hotelAddressPincode: {type: String, optional: true},
  hotelAddressLandmark: {type: String, optional: true},
  hotelPhone: {type: String, optional: true},
  hotelWebsite: {type: String, optional: true},
  hotelGoogleMapLink: {type: String, optional: true},
  hotelDescription: {type: String, optional: true},

  hotelAirpotPickupCharges:{type: SimpleSchema.Integer},
  hotelAirpotDropCharges:{type: SimpleSchema.Integer},
  hotelImageUrl:{type:String,optional:true}


});


export const HotelforsaleReserveSchema = new SimpleSchema({
  'hotelId': { type: String },
  'hotelRoomId': { type : String },
  'hotelRooms': { type: SimpleSchema.Integer , min: 1 }
});

export const HotelforsaleBookSchema = new SimpleSchema({
  'hotelId': {type:String },
  'roomId': { type: String },
  'eventId': {type:String },
  'hotelBookingReferenceNo':{type:String},
  'selectedPeople': {type: Array, min: 1},
  'selectedPeople.$': String
});
