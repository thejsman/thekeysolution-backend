// Time-stamp: 2017-06-22 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';

export const HotelRoomUpdateSchema = new SimpleSchema({
  bookingId: String,
  roomNumber: String,
  hotelRoomId: String
});

export const HotelRoomRemarksUpdateSchema = new SimpleSchema({
  bookingId: String,
  roomRemarks: String,
  hotelRoomId: String
});

export const HotelRoomSchema = new SimpleSchema({
  id: { type: String, optional: true },
  hotelId: { type : String },
  eventId: { type : String },
  hotelRoomCategory: String,
  hotelRoomType: {type:String, optional:true},
  // hotelRoomMaxOccupants: {type: SimpleSchema.Integer, min : 1},
  hotelRoomTotal: {type: SimpleSchema.Integer, min : 0, optional: true, defaultValue: 0},
  hotelRoomBedType: {type: String},
  hotelRoomIsSmoking: {type: String, defaultValue:'none'},
  hotelRoomIsAdjoining: {type: String, defaultValue:'none'},
  hotelRoomIsConnecting: {type: String, defaultValue:'none'},
  // placeholderRoomNumber: { type: String },
  // hotelRoomFrom: { type: String },
  // hotelRoomTo : { type: String },
  hotelRoomRemarks : { type: String, optional:true}  
});

export const HotelSchema = new SimpleSchema({
  eventId: { type : String },
  hotelId: { type: String, optional: true },
  hotelName: { type: String },  
  hotelContactName : {type: String, optional: true},
  hotelContactDesignation : {type: String, optional: true},
  hotelContactPhone : {type: String, optional: true},
  hotelType: {type: String, optional: true},
  hotelAddress1: {type: String, optional: true},
  hotelAddress2: {type: String, optional: true},
  hotelAddressCity: {type: String, optional: true},
  hotelAddressState: {type: String, optional: true},
  hotelAddressPincode: {type: String, optional: true},
  hotelAddressLandmark: {type: String, optional: true}  
});


export const HotelReserveSchema = new SimpleSchema({
  'hotelId': { type: String },
  'hotelRoomId': { type : String },
  'hotelRooms': { type: SimpleSchema.Integer , min: 1 }
});

export const HotelBookSchema = new SimpleSchema({
  'hotelId': {type:String },
  'roomId': { type: String },
  'folioNumber': { type: String, optional: true },
  'eventId': {type:String },
  // 'selectedPeople': {type: Array, min: 1},
  // 'selectedPeople.$': String,
  guestId: {type: String, optional: true, defaultValue: null},
  hotelRoomFrom: { type: String, optional: true },
  hotelRoomTo : { type: String, optional: true },
  roomNumber: { type: String, optional: true },
  placeHolderRoomNumber : { type: String, optional: true },
});
