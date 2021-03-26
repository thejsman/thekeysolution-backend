// Time-stamp: 2017-07-29 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : methods.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RoomSchema } from './schema.js';
import { RoomBookingSchema } from './schema.js';
import { Guests } from '../guests/guests.js';
import { RoomBookings } from './roomBooking.js';
import { Events } from '../events/events.js';

export const insertRoom = new ValidatedMethod({
  name: "Rooms.methods.insert",
  validate: RoomSchema.validator( { clean: true }),
  run(roomNew) {
    var event = Events.findOne({
      _id: roomNew.eventId
    });

    if(event) {
      // Rooms.insert(roomNew);
    }
    else {
      throw new Meteor.Error("Event Id Invalid");
    }
  }
});

export const updateRoom = new ValidatedMethod({
  name: "Rooms.methods.update",
  validate: RoomSchema.validator({ clean: true }),
  run(roomUpdate) {
    if(Roles.userIsInRole(this.userId, 'food-list')) {
  //     Rooms.update(roomUpdate.eventId, {
  // $set: roomUpdate
  //     });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});


// export const deleteFood = new ValidatedMethod({
//   name: "Foods.methods.delete",
//   validate: null,
//   run(id) {
//     if(Roles.userIsInRole(this.userId, 'food-list')) {
//       Foods.remove({
//   _id: id
//       });
//     }
//     else {
//       throw new Meteor.Error("NO PERMISSIONS");
//     }
//   }
// });

export const bookRooms = new ValidatedMethod({
  name: "Rooms.methods.assign",
  validate: RoomBookingSchema.validator( { clean: true }),
  run(booking) {
    var eventId = booking.eventId;
    var roomId = booking.roomId;

    var event = Events.findOne({
      _id: eventId
    });


    var guest = Guests.findOne({
      _id: booking.guestId
    });

    if(event && guest) {
      var alreadyBooked = RoomBookings.findOne({
  eventId: eventId,
  guestId: booking.guestId
      });

     if(alreadyBooked) {
  throw new Meteor.Error("Already booked");
      }
      else {
  RoomBookings.insert(booking);
      }
    }
    else {
      throw new Meteor.Error("Invalid data");
    }
  }
});