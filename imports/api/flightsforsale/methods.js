// Time-stamp: 2017-06-21
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : methods.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/meteor-roles';
import { Events } from '../events/events.js';
import { Flightsforsale } from './flightsforsale.js';
import { FlightforsaleBookings } from './flightforsaleBookings.js';
import { FlightforsaleSchema, FlightforsaleBookingSchema,FlightforsaleBulkBookingSchema } from './schema.js';
import { Guests } from '../guests/guests.js';
import { insertActivity } from '../../api/activity_record/methods.js';
import _ from 'lodash';

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
     var activityEvent=''
     var activityUserInfo={
        id:Meteor.userId(),
        name:Meteor.user().profile.name,
        email:Meteor.user().emails[0].address,
      }
      if(data.eventId==null || data.eventId=='' || data.eventId==undefined){
         activityEvent='general';
      }
      else{
         var event=Events.findOne(data.eventId);
         activityEvent=event.basicDetails.eventName;
      }
      var date = new Date();
      userdata={
        activityeDateTime:date, //date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+'.'+date.getMilliseconds(),
        activityUserInfo:activityUserInfo,
        activityModule:data.activityModule,
        activitySubModule:data.activitySubModule,
        activityEvent:activityEvent,
        activityMessage:data.activityMessage,

      }
      insertActivity.call(userdata, (err, res) => {
      if(err) {
        console.log('Insert Activity record Error :: ',  err);
        return 0;
      }
      else {
        return true;
      }
    });
};

export const insertFlightforsale = new ValidatedMethod({
  name: "Flightsforsale.methods.insert",
  validate: FlightforsaleSchema.validator({ clean: true }),
  run(newFlight) {
    var event = Events.findOne({
      _id: newFlight.eventId
    });

    if(event) {
  //     var isGroup = newFlight.flightIsGroupPNR;
  //     var totalSeatCount = newFlight.flightTotalSeats;
  //     if(isGroup) {
	// totalSeatCount = 1;
  //     }
  //     if(newFlight.flightPNRs.length !== totalSeatCount) {
	// throw new Meteor.Error("PNR and seat mismatch");
  //     }
      Flightsforsale.insert(newFlight);
    }
    else {
      throw new Meteor.Error("Event id invalid");
    }
  }
});

export const updateFlightforsale = new ValidatedMethod({
  name: "Flightsforsale.methods.update",
  validate: FlightforsaleSchema.validator({ clean: true }),
  run(updateFlight) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'edit-flights')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }
        var event = Events.findOne({
      _id: updateFlight.eventId
    });

    if(event) {
  //     var isGroup = updateFlight.flightIsGroupPNR;
  //     var totalSeatCount = updateFlight.flightTotalSeats;
  //     if(isGroup) {
	// totalSeatCount = 1;
  //     }
  //     if(updateFlight.flightPNRs.length !== totalSeatCount) {
	// throw new Meteor.Error("PNR and seat mismatch");
  //     }
      Flightsforsale.update(updateFlight.flightId, {
	$set: updateFlight
      });
    }
    else {
      throw new Meteor.Error("Event id invalid");
    }
  }
});


export const deleteFlightforsale = new ValidatedMethod({
  name: "Flightsforsale.methods.delete",
  validate: null,
  run(flightId) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'delete-flights')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }
    Flightsforsale.remove(flightId);
    FlightforsaleBookings.remove({ flightId });
  }
});

// ABL SAM BOC GROUP BOOKING METHOD

export const GroupbookFlightforsale = new ValidatedMethod({
  name: "GroupFlightforsaleBookings.methods.insert",
  validate: FlightforsaleBulkBookingSchema.validator(),
  run(bookingData) {
// CHECK BOOKING EXISTING FOR ANY GUEST

var error_count=0;
var errorMessage="";
var successBooking=0;
   _.each(bookingData.guestIds, (person) => {
    var booking=bookingData;
     booking.guestId=person;
     delete booking.guestIds; 
    var eventId = booking.eventId;
    var event = Events.findOne({
      _id: eventId
    });
    var guest = Guests.findOne({
      _id: booking.guestId
    });
    if(event && guest) {
      var alreadyBooked = FlightforsaleBookings.findOne({
  eventId: eventId,
  guestId: booking.guestId,
  flightId: booking.flightId
      });
      if(alreadyBooked) {
        error_count++;
        errorMessage=errorMessage+" Flight Already booked for "+guest.guestFirstName+" "+guest.guestLastName;
      }
      else {

  FlightforsaleBookings.insert(booking);
  successBooking++;
         //code to insert data in Activity Record
       let guests = Guests.findOne( booking.guestId );

       activityInsertData={
          eventId:guests.eventId,
          activityModule:'Guests',
          activitySubModule:'Flight',
          event:'add',
          activityMessage:'Flight is booked for '+guests.guestTitle+' '+guests.guestFirstName+' '+guests.guestLastName+'.'
      }
      activityRecordInsert(activityInsertData);

      }
    }
    else {
      error_count++;
      errorMessage="Invalid data result";
      
    }
   });
    if(error_count>0){
        throw new Meteor.Error(errorMessage);
    }
  }
});
// ABL SAM EOC GROUP BOOKING

export const PersonalbookFlightforsale = new ValidatedMethod({
  name: "PersonalFlightforsaleBookings.methods.insert",
  validate: FlightforsaleBookingSchema.validator(),
  run(booking) {
    var eventId = booking.eventId;
    var event = Events.findOne({
      _id: eventId
    });
    var guest = Guests.findOne({
      _id: booking.guestId
    });
    if(event && guest) {
      var alreadyBooked = FlightforsaleBookings.findOne({
	eventId: eventId,
	guestId: booking.guestId,
	flightId: booking.flightId
      });
      if(alreadyBooked) {
	throw new Meteor.Error("Already booked");
      }
      else {

	FlightforsaleBookings.insert(booking);

         //code to insert data in Activity Record
       let guests = Guests.findOne( booking.guestId );

       activityInsertData={
          eventId:guests.eventId,
          activityModule:'Guests',
          activitySubModule:'Flight',
          event:'add',
          activityMessage:'Flight is booked for '+guests.guestTitle+' '+guests.guestFirstName+' '+guests.guestLastName+'.'
      }
      activityRecordInsert(activityInsertData);

      }
    }
    else {
      throw new Meteor.Error("Invalid data result");
    }
  }
});

export const PersonalRemoveFlightforsaleBooking = new ValidatedMethod({
  name: "FlightforsaleBookings.Remove",
  validate: null,
  run(bookingId) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'delete-flight-booking')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }

        var flights = FlightforsaleBookings.findOne( bookingId );

      FlightforsaleBookings.remove(bookingId);

            //code to insert data in Activity Record
       let guests = Guests.findOne( flights.guestId );

       activityInsertData={
          eventId:flights.eventId,
          activityModule:'Guests',
          activitySubModule:'Flight',
          event:'delete',
          activityMessage:'Personal Flight is canceled for '+guests.guestTitle+' '+guests.guestFirstName+' '+guests.guestLastName+'.'
      }
      activityRecordInsert(activityInsertData);

  }
});


export const bookFlightforsale = new ValidatedMethod({
  name: "FlightforsaleBookings.methods.insert",
  validate: FlightforsaleBookingSchema.validator({ clean: true }),
  run(booking) {
    var eventId = booking.eventId;
    var flightId = booking.flightId;

    var event = Events.findOne({
      _id: eventId
    });
    var flight = Flightsforsale.findOne({
      _id: flightId,
      flightPNRs: booking.pnrNumber
    });

    var guest = Guests.findOne({
      _id: booking.guestId
    });

    console.log(booking);
    if(event && flight && guest) {
      var alreadyBooked = FlightforsaleBookings.findOne({
	eventId: eventId,
	guestId: booking.guestId,
	flightId: flightId
      });
      console.log(alreadyBooked);
      if(getAvailableSeats({eventId, flightId}) < 1) {
	throw new Meteor.Error("Flight full");
      }
      else if(alreadyBooked) {
	throw new Meteor.Error("Already booked");
      }
      else {
	FlightforsaleBookings.insert(booking);

            //code to insert data in Activity Record
       let guests = Guests.findOne( booking.guestId );

       activityInsertData={
          eventId:guests.eventId,
          activityModule:'Guests',
          activitySubModule:'Flight',
          event:'add',
          activityMessage:'Flight is booked for '+guests.guestTitle+' '+guests.guestFirstName+' '+guests.guestLastName+'.'
      }
      activityRecordInsert(activityInsertData);

      }
    }
    else {
      console.log("helloerror");
      throw new Meteor.Error("Invalid data");
    }
  }
});

export const getAvailableFlights = new ValidatedMethod({
  name: "FlightForSale.methods.getAvailable",
  validate: null,
  run(data) {
    return getAvailableSeats(data);
  }
});

function getAvailableSeats({ eventId, flightId }) {
  var flight = Flightsforsale.findOne({
      _id: flightId
    });

    if(flight) {
      var bookings = FlightforsaleBookings.find({
	eventId: eventId,
	flightId: flightId
});
      return flight.flightTotalTicketQty - bookings.count();
    }
    else {
      return 0;
    }
}
