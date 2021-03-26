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
import { TransportDrivers } from './transport_drivers.js';
import { TransportBookings } from './transportbookings.js';
import { TransportVehicles } from './transport_vehicles.js';
import { driverBookings } from './driverBooking.js';
import { VehicleBookings } from './vehicleBooking.js';
import { Roles } from 'meteor/meteor-roles';
import { Events } from '../events/events.js';
import { Guests } from '../guests/guests.js';
import { TransportDriverSchema, TransportDriverSchemaStrict , DriverBookingSchema } from './driver_schema.js';
import { TransportBookSchema } from './schema.js';
import { TransportVehicleSchema, TransportVehicleSchemaStrict, VehicleBookingSchema } from './vehicle_schema.js';
import { insertActivity } from '../../api/activity_record/methods.js';
import _ from 'lodash';
import moment from 'moment';

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
 //code to insert data in Activity Record
function activityRecordInsert(data){
     var activityEvent='';
     var activityEventId='';
     var activityUserInfo={
        id:Meteor.userId(),
        name:Meteor.user().profile.name,
        email:Meteor.user().emails[0].address,
      }
      if(data.eventId==null || data.eventId=='' || data.eventId==undefined){
         activityEvent='general';
         activityEventId='general';
      }
      else{
         var event=Events.findOne(data.eventId);
         activityEvent=event.basicDetails.eventName;
         activityEventId=event._id;
      }
      var date = new Date();
      userdata={
        activityeDateTime:date, //date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+'.'+date.getMilliseconds(),
        activityUserInfo:activityUserInfo,
        activityModule:data.activityModule,
        activitySubModule:data.activitySubModule,
        activityEvent:activityEvent,
        activityEventId:activityEventId,
        activityMessage:data.activityMessage,

      }
      insertActivity.call(userdata, (err, res) => {
      if(err) {
        return 0;
      }
      else {
        return true;
      }
    });
};

export const insertDriver = new ValidatedMethod({
  name: "Transport.methods.drivers.insert",
  validate: TransportDriverSchema.validator({ clean : true }),
  run(driverNew) {
    var event = Events.findOne({
      _id: driverNew.eventId
    });

    if(event) {
      TransportDrivers.insert(driverNew);
    }
    else {
      throw new Meteor.Error("Event Id Invalid");
    }
  }
});


export const insertVehicle = new ValidatedMethod({
  name: "Transport.methods.vehicles.insert",
  validate: TransportVehicleSchema.validator({ clean: true }),
  run(vehicleNew) {
    var event = Events.findOne({
      _id: vehicleNew.eventId
    });
    console.log(vehicleNew);
    if(event) {
      TransportVehicles.insert(vehicleNew);
    }
    else {
      throw new Meteor.Error("Event Id Invalid");
    }
  }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const updateDriver = new ValidatedMethod({
  name: "Transport.methods.drivers.edit",
  validate: TransportDriverSchema.validator({ clean: true }),
  run(driverUpdate) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'edit-transport')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }
    if(Roles.userIsInRole(this.userId, 'transport-driver-list')) {
      TransportDrivers.update(driverUpdate.driverId, {
  $set: driverUpdate
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});


export const deleteDriver = new ValidatedMethod({
  name: "Transport.methods.drivers.remove",
  validate: null,
  run(id) {
    // ABL_SAM added Permission Check
    if(!isAllowed(this.userId, 'delete-transport')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    TransportDrivers.remove({
      _id: id
    });
  }
});


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const updateVehicle = new ValidatedMethod({
  name: "Transport.methods.vehicles.edit",
  validate: TransportVehicleSchema.validator({ clean: true }),
  run(vehicleUpdate) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'edit-transport')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }
    if(Roles.userIsInRole(this.userId, 'transport-vehicle-list')) {
      TransportVehicles.update(vehicleUpdate.vehicleId, {
  $set: vehicleUpdate
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});


export const deleteVehicle = new ValidatedMethod({
  name: "Transport.methods.vehicles.remove",
  validate: null,
  run(id) {
    // ABL_SAM added Permission Check
    if(!isAllowed(this.userId, 'delete-transport')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    TransportVehicles.remove({
      _id: id
    });
  }
});

export const bookTransport = new ValidatedMethod({
  name: "Transport.methods.book",
  validate: TransportBookSchema.validator(),
  run(booking) {
    let { eventId, vehicleId, driverId, transportStartDate, transportStartTime, transportEndDate, transportEndTime, transportType } = booking;

    if(transportType === 'dedicated') {
      let bookings = TransportBookings.find({
  eventId,
  $or: [{ vehicleId }, { driverId }]
      });
      checkTime(booking, bookings);
    }
    else {
      let bookings = TransportBookings.find({
  eventId,
  $or: [{ vehicleId }, { driverId }],
  transportType: 'dedicated'
      });
      checkTime(booking, bookings);
    }
    TransportBookings.insert(booking);

     //code to insert data in Activity Record
    let guests = Guests.findOne( booking.guestId );
     activityInsertData={
          eventId:booking.eventId,
          activityModule:'Guests',
          activitySubModule:'Transport',
          event:'insert',
          activityMessage:'Transport of guest member '+guests.guestTitle+' '+guests.guestFirstName+' '+guests.guestLastName+' is added.'

      }
      activityRecordInsert(activityInsertData);
  }
});

export const removeTransport = new ValidatedMethod({
  name: "Transport.methods.delete",
  validate: null,
  run(bookingId) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'delete-transport-booking')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }

        let transports = TransportBookings.findOne( bookingId ); //Acitivity Record guest data fetch
        let guests = Guests.findOne( transports.guestId );
    TransportBookings.remove(bookingId);

     //code to insert data in Activity Record
     activityInsertData={
          eventId:transports.eventId,
          activityModule:'Guests',
          activitySubModule:'Transport',
          event:'delete',
          activityMessage:'Transport of guest member '+guests.guestTitle+' '+guests.guestFirstName+' '+guests.guestLastName+' is deleted.'

      }
      activityRecordInsert(activityInsertData);

  }
});

export const editTransport = new ValidatedMethod({
  name: "Transport.methods.update",
  validate: TransportBookSchema.validator(),
  run(booking) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'edit-transport-booking')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }  let { bookingId, eventId, vehicleId, driverId, transportStartDate, transportStartTime, transportEndDate, transportEndTime, transportType } = booking;

    if(transportType === 'dedicated') {
      let bookings = TransportBookings.find({
  _id: { $ne: bookingId },
  eventId,
  $or: [{ vehicleId }, { driverId }]
      });
      checkTime(booking, bookings);
    }
    else {
      let bookings = TransportBookings.find({
  _id: { $ne: bookingId },
  eventId,
  $or: [{ vehicleId }, { driverId }],
  transportType: 'dedicated'
      });
      checkTime(booking, bookings);
    }
    TransportBookings.update(bookingId, {
      $set: booking
    });
         //code to insert data in Activity Record
    let guests = Guests.findOne( booking.guestId );
     activityInsertData={
          eventId:booking.eventId,
          activityModule:'Guests',
          activitySubModule:'Transport',
          event:'update',
          activityMessage:'Transport of guest member '+guests.guestTitle+' '+guests.guestFirstName+' '+guests.guestLastName+' is updated.'

      }
      activityRecordInsert(activityInsertData);
  }
});



function checkTime(booking, bookings) {
  let flag = false;
  let parse = "DD MMMM, YYYY, HH:mma";
  let bookingStart = booking.transportStartDate + ', '+booking.transportStartTime;
  let bookingStartMoment = moment(bookingStart, parse);
  let bookingEnd = booking.transportEndDate + ', '+ booking.transportEndTime;
  let bookingEndMoment = moment(bookingEnd, parse);
  bookings.forEach(b => {
    let start = b.transportStartDate + ', '+b.transportStartTime;
    let startmoment = moment(start, parse);
    let end = b.transportEndDate + ', '+b.transportEndTime;
    let endmoment = moment(end,  parse);
    // (StartA <= EndB)  and  (EndA >= StartB)
    if(bookingStartMoment.isBefore(endmoment) && (bookingEndMoment.isAfter(startmoment))) {
      throw new Meteor.Error("Driver/Vehicle not available");
    }
  });
}


export const bookDrivers = new ValidatedMethod({
  name: "Drivers.methods.assign",
  validate: DriverBookingSchema.validator( { clean: true }),
  run(booking) {
    var eventId = booking.eventId;
    var driverId = booking.driverId;

    var event = Events.findOne({
      _id: eventId
    });

    var drivers = TransportDrivers.findOne({
      _id: driverId
    });

    var guest = Guests.findOne({
      _id: booking.guestId
    });

    if(event && drivers && guest) {
      var alreadyBooked = driverBookings.findOne({
  eventId: eventId,
  guestId: booking.guestId
      });

     if(alreadyBooked) {
  throw new Meteor.Error("Already booked");
      }
      else {
  driverBookings.insert(booking);

     //code to insert data in Activity Record
     activityInsertData={
          eventId:eventId,
          activityModule:'Guests',
          activitySubModule:'Transport Driver',
          event:'insert',
          activityMessage:'Driver is booked for guest member '+guest.guestTitle+' '+guest.guestFirstName+' '+guest.guestLastName+'.'

      }
      activityRecordInsert(activityInsertData);

      }
    }
    else {
      throw new Meteor.Error("Invalid data");
    }
  }
});

export const bookVehicles = new ValidatedMethod({
  name: "Vehicles.methods.assign",
  validate: VehicleBookingSchema.validator( { clean: true }),
  run(booking) {
    var eventId = booking.eventId;
    var vehicleId = booking.vehicleId;

    var event = Events.findOne({
      _id: eventId
    });

    var vehicles = TransportVehicles.findOne({
      _id: vehicleId
    });

    var guest = Guests.findOne({
      _id: booking.guestId
    });

    if(event && vehicles && guest) {
      var alreadyBooked = VehicleBookings.findOne({
  eventId: eventId,
  guestId: booking.guestId
      });

     if(alreadyBooked) {
  throw new Meteor.Error("Already booked");
      }
      else {
  VehicleBookings.insert(booking);

         //code to insert data in Activity Record
     activityInsertData={
          eventId:eventId,
          activityModule:'Guests',
          activitySubModule:'Vehicle',
          event:'insert',
          activityMessage:'Transport vehicle for guest member '+guest.guestTitle+' '+guest.guestFirstName+' '+guest.guestLastName+' is booked.'

      }
      activityRecordInsert(activityInsertData);

      }
    }
    else {
      throw new Meteor.Error("Invalid data");
    }
  }
});
