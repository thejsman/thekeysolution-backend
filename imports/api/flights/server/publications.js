import { Meteor } from 'meteor/meteor';
import { Flights } from '../flights.js';
import { FlightBookings } from '../flightBookings.js';


Meteor.publish('flights.all', function(id) {
  return Flights.find({
    eventId: id
  });
});
Meteor.publish('flight.bookings.guest', function(id) {
  return FlightBookings.find({
    guestId: id
  });
});

Meteor.publish('flights.one', function(id) {
  return Flights.find(id);
});

Meteor.publish('flights.bookings.total', function() {
  return FlightBookings.find();
});
