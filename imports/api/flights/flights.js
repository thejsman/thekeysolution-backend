import { Mongo } from 'meteor/mongo';
import { FlightBookings } from './flightBookings.js';
export const Flights = new Mongo.Collection('flights');

Flights.before.remove((userId, doc) => {
  let flightId = doc._id;
  FlightBookings.remove({ flightId });
});
