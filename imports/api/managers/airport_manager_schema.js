







import SimpleSchema from 'simpl-schema';

export const AirportManagerSchema = new SimpleSchema({
  managerId: { type: String, optional: true },
  eventId: { type: String },
  airportManagerName: { type: String },
  airportManagerNo: { type: String },
  airportManagerLocation: { type: String }
});



export const AirportManagerBookingSchema = new SimpleSchema({
  eventId: String,
  MId: {type:String, optional:true},
  guestId: String,
});
