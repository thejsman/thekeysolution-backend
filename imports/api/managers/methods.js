// Time-stamp: 2017-07-28
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : methods.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { AirportManager } from './airportmanager.js';
import { HospitalityManager } from './hospitalitymanager.js';
import { AirportManagerBooking } from './airportmanagerBooking.js';
import { HospitalityManagerBooking } from './hospitalitymanagerBooking.js';
import { Events } from '../events/events.js';
import { Guests } from '../guests/guests.js';
import { AirportManagerSchema} from './airport_manager_schema.js';
import { HospitalityManagerSchema} from './hospitality_manager_schema.js';
import _ from 'lodash';
import { Roles } from 'meteor/meteor-roles';

let isAllowed = (userId, role) => {
  let scopes = Roles.getScopesForUser(userId);
  console.log(scopes);
  if (scopes.length > 0) {
    for (var i = 0; i < scopes.length; i++) {
      if (Roles.userIsInRole(userId, role, scopes[i])) {
        return true;
      }
    }
    return false;
  }
  return Roles.userIsInRole(userId, role);
};

export const insertAirportManager = new ValidatedMethod({
  name: "Manager.methods.airport.insert",
  validate: AirportManagerSchema.validator({ clean : true }),
  run(airmanNew) {
    var event = Events.findOne({
      _id: airmanNew.eventId
    });

    if(event) {
      AirportManager.insert(airmanNew);
    }
    else {
      throw new Meteor.Error("Event Id Invalid");
    }
  }
});


export const insertHospitalityManager = new ValidatedMethod({
  name: "Manager.methods.hospitality.insert",
  validate: HospitalityManagerSchema.validator({ clean: true }),
  run(hosman) {
    var event = Events.findOne({
      _id: hosman.eventId
    });
    console.log(hosman);
    if(event) {
      HospitalityManager.insert(hosman);
    }
    else {
      throw new Meteor.Error("Event Id Invalid");
    }
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const updateHospitalityManager = new ValidatedMethod({
  name: "Transport.methods.hospitality.update",
  validate: HospitalityManagerSchema.validator({ clean: true }),
  run(managerUpdate) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'edit-managers')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }
    HospitalityManager.update(managerUpdate.managerId, {
	$set: managerUpdate
      });
  }
});


export const deleteHosman = new ValidatedMethod({
  name: "Manager.methods.hos.remove",
  validate: null,
  run(id) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'delete-managers')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }
    HospitalityManager.remove({
  _id: id
      });
  }
});


// /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const updateAirManager = new ValidatedMethod({
  name: "Transport.methods.airmanager.edit",
  validate: AirportManagerSchema.validator({ clean: true }),
  run(vehicleUpdate) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'edit-managers')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }
    AirportManager.update(vehicleUpdate.managerId, {
	$set: vehicleUpdate
      });
  }
});


export const deleteAirman = new ValidatedMethod({
  name: "Manager.methods.air.remove",
  validate: null,
  run(id) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'delete-managers')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }
    AirportManager.remove({
  _id: id
      });
  }
});


// export const bookDrivers = new ValidatedMethod({
//   name: "Drivers.methods.assign",
//   validate: DriverBookingSchema.validator( { clean: true }),
//   run(booking) {
//     var eventId = booking.eventId;
//     var driverId = booking.driverId;

//     var event = Events.findOne({
//       _id: eventId
//     });

//     var drivers = TransportDrivers.findOne({
//       _id: driverId
//     });

//     var guest = Guests.findOne({
//       _id: booking.guestId
//     });

//     if(event && drivers && guest) {
//       var alreadyBooked = driverBookings.findOne({
//   eventId: eventId,
//   guestId: booking.guestId
//       });

//      if(alreadyBooked) {
//   throw new Meteor.Error("Already booked");
//       }
//       else {
//   driverBookings.insert(booking);
//       }
//     }
//     else {
//       throw new Meteor.Error("Invalid data");
//     }
//   }
// });

// export const bookVehicles = new ValidatedMethod({
//   name: "Vehicles.methods.assign",
//   validate: VehicleBookingSchema.validator( { clean: true }),
//   run(booking) {
//     var eventId = booking.eventId;
//     var vehicleId = booking.vehicleId;

//     var event = Events.findOne({
//       _id: eventId
//     });

//     var vehicles = TransportVehicles.findOne({
//       _id: vehicleId
//     });

//     var guest = Guests.findOne({
//       _id: booking.guestId
//     });

//     if(event && vehicles && guest) {
//       var alreadyBooked = VehicleBookings.findOne({
//   eventId: eventId,
//   guestId: booking.guestId
//       });

//      if(alreadyBooked) {
//   throw new Meteor.Error("Already booked");
//       }
//       else {
//   VehicleBookings.insert(booking);
//       }
//     }
//     else {
//       throw new Meteor.Error("Invalid data");
//     }
//   }
// });
