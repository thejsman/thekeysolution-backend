// Time-stamp: 2017-07-28 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : vehicle_schema.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';

export const TransportVehicleSchema = new SimpleSchema({
	vehicleId: {
    type: String,
    optional: true
  },
  eventId: { type: String },
  vehicleType: { type: String },
  vehicleNo: { type: String },
  vehicleSeats: { type: SimpleSchema.Integer },
  vehicleRemarks: { type: String, optional: true }
});

export const TransportVehicleSchemaStrict = new SimpleSchema({
  vehicleId: { type: String },
  eventId: { type: String },
  vehicleType: { type: String },
  vehicleNo: { type: String },
  vehicleSeats: { type: SimpleSchema.Integer }
});


export const VehicleBookingSchema = new SimpleSchema({
  eventId: String,
  vehicleId: {type:String, optional:true},
  guestId: String,
  IsDedicated:{type:Boolean},
  MaxPersons:{type:String, optional:true},
  VehicleRemarks:{type:String},
  OnlyRemarks:{type:String},
  sendDate:{type:String},
  sendTime:{type:String},
  notification:{type:String},
  notificationTime:{type:String},
  notificationDate:{type:String}
});
