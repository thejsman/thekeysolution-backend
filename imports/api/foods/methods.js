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
import { FoodSchema } from './schema.js';
import { FoodBookingSchema } from './schema.js';
import { Foods } from './foods.js';
import { Guests } from '../guests/guests.js';
import { FoodBookings } from './foodBooking.js';
import { Events } from '../events/events.js';

export const insertFood = new ValidatedMethod({
  name: "Foods.methods.insert",
  validate: FoodSchema.validator( { clean: true }),
  run(foodNew) {
    var event = Events.findOne({
      _id: foodNew.eventId
    });

    if(event) {
      Foods.insert(foodNew);
    }
    else {
      throw new Meteor.Error("Event Id Invalid");
    }
  }
});

export const updateFood = new ValidatedMethod({
  name: "Foods.methods.update",
  validate: FoodSchema.validator({ clean: true }),
  run(foodUpdate) {
    if(Roles.userIsInRole(this.userId, 'food-list')) {
      console.log(foodUpdate.foodOption1)
      console.log(foodUpdate.eventId)
      Foods.update(foodUpdate.eventId, {
  $set: foodUpdate
      });
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

export const bookFoods = new ValidatedMethod({
  name: "Foods.methods.assign",
  validate: FoodBookingSchema.validator( { clean: true }),
  run(booking) {
    var eventId = booking.eventId;
    var foodId = booking.foodId;

    var event = Events.findOne({
      _id: eventId
    });


    var guest = Guests.findOne({
      _id: booking.guestId
    });

    if(event && guest) {
      var alreadyBooked = FoodBookings.findOne({
  eventId: eventId,
  guestId: booking.guestId
      });

     if(alreadyBooked) {
  throw new Meteor.Error("Already booked");
      }
      else {
  FoodBookings.insert(booking);
      }
    }
    else {
      throw new Meteor.Error("Invalid data");
    }
  }
});