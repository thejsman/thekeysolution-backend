// Time-stamp: 2017-07-28 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { TransportVehicles } from '../transport_vehicles.js';
import { TransportDrivers } from '../transport_drivers.js';
import { driverBookings } from '../driverBooking.js';
import { VehicleBookings } from '../vehicleBooking.js';

Meteor.publish('vehicles.event', function(id) {
  return TransportVehicles.find({
    eventId: id
  });
});

Meteor.publish('drivers.event', function(id) {
  return TransportDrivers.find({
    eventId: id
  });
});

Meteor.publish('driverbookings.all', function(eventId) {
  return driverBookings.find({
    eventId: eventId
  });
});

Meteor.publish('vehiclebookings.all', function(eventId) {
  return VehicleBookings.find({
    eventId: eventId
  });
});