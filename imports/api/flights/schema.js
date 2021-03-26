// Time-stamp: 2017-06-20 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';


/// Add checks to ensure time parity between from and to 
export const FlightLegSchema = new SimpleSchema({
  _id: String,
  flightId: String,
  flightNo: String,
  airlineIATA: {type:String , optional:true},
  flightDate: {type:String , optional:true},
  flightDepartureCityId: String,
  flightDepartureTime: String,
  flightDepartureGate: {type:String , optional:true},
  flightDepartureTerminal: {type:String , optional:true},
  flightArrivalCityId: String,
  flightArrivalTime: String,
  flightArrivalGate: {type:String , optional:true},
  flightArrivalTerminal: {type:String , optional:true},
  pnr: {type:String , optional:true}
});

export const FlightSchema = new SimpleSchema({
  eventId: { type : String },
  flightId: { type: String, optional: true },
  flightLegs: {
    type: Array, minCount: 1
  },
  'flightLegs.$': FlightLegSchema,
  flightTotalSeats: SimpleSchema.Integer,
  flightIsGroupPNR: Boolean,
  flightIsBusiness: Boolean,
  flightPNRs: {
    type: Array, minCount: 1
  },
  'flightPNRs.$': String
});

export const FlightBookingSchema = new SimpleSchema({
  eventId: String,
  flightId: {type:String, optional:true},
  pnrNumber: String,
  agencyProvided:{type:Boolean , defaultValue:false},
  guestId: String,
  // flightDetails:{ type : Array},
  // 'flightDetails.$': {
  //   type : FlightDetailsSchema

  // }
  flightLegs: {
    type: Array, optional: true
  },
  'flightLegs.$': FlightLegSchema
});

