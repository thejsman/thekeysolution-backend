// Time-stamp: 2018-02-13
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Saurabh@Abalone Technologies Pvt Ltd (ABL)
// Description        :
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';


/// Add checks to ensure time parity between from and to
export const FlightforsaleLegSchema = new SimpleSchema({
  _id: String,
  flightId: String,// AIRPORT ID
  flightNo: String,
  flightPNR: String,
  flightIsEconomyClass: { type: Boolean, optional: true },
  flightDepartureCityId: String,
  flightDepartureTime: String,
  flightDepartureGate: {type:String , optional:true},
  flightDepartureTerminal: {type:String , optional:true},
  flightArrivalCityId: String,
  flightArrivalTime: String,
  flightArrivalGate: {type:String , optional:true},
  flightArrivalTerminal: {type:String , optional:true},
  flightDurationHours: {type: String},
  flightDurationMins: {type: String}

});


// export const FlightDetailsSchema = new SimpleSchema({
  // flightNumber:String,
  // flightDepartureCity: String,
  // flightDepartureTime: String,
  // flightArrivalCity: String,
  // flightArrivalTime: String,
// });

export const FlightforsaleSchema = new SimpleSchema({
  eventId: { type : String },
  flightEventCity: { type : String },
  flightArrivalCity: { type : String },
  flightDepartureCity: { type : String },
  flightTotalTicketQty: SimpleSchema.Integer,
  flightCostPerTicket: SimpleSchema.Integer,
  flightIsReturnType: { type: Boolean, optional: true },
  flightIsDepartureTicket: { type: Boolean, optional: true },
  flightDisclaimer: { type : String },
  flightId: { type: String, optional: true },
  flightLegs: {
    type: Array, minCount: 1
  },
  'flightLegs.$': FlightforsaleLegSchema

});

export const FlightforsaleBookingSchema = new SimpleSchema({
  eventId: String,
  flightId: {type:String, optional:true},
  agencyProvided:{type:Boolean , defaultValue:true},
  guestId: String,
  flightBookingReferenceNo:String,
  flightBookCost:SimpleSchema.Integer,
  // flightDetails:{ type : Array},
  // 'flightDetails.$': {
  //   type : FlightDetailsSchema

  // }
  flightLegs: {
    type: Array, optional: true
  },
  'flightLegs.$': FlightforsaleLegSchema
});



export const FlightforsaleBulkBookingSchema = new SimpleSchema({
  eventId: String,
  flightId: {type:String, optional:true},
  agencyProvided:{type:Boolean , defaultValue:true},
  guestIds: Array,
  'guestIds.$': {type:String},

  flightBookingReferenceNo:String,
  flightBookCost:SimpleSchema.Integer,
  // flightDetails:{ type : Array},
  // 'flightDetails.$': {
  //   type : FlightDetailsSchema

  // }
  flightLegs: {
    type: Array, optional: true
  },
  'flightLegs.$': FlightforsaleLegSchema
});
