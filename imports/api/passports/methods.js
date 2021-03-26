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
import { PassportSchema } from './schema.js';
import { PassportBookingSchema } from './schema.js';
import { Passports } from './passports.js';
import { Guests } from '../guests/guests.js';
import { PassportBookings } from './passportBooking.js';
import { Events } from '../events/events.js';

// export const insertGift = new ValidatedMethod({
//   name: "Gifts.methods.insert",
//   validate: GiftSchema.validator( { clean: true }),
//   run(giftNew) {
//     var event = Events.findOne({
//       _id: giftNew.eventId
//     });

//     giftNew.available = giftNew.giftQuantity;

//     if(event) {
//       Gifts.insert(giftNew);
//     }
//     else {
//       throw new Meteor.Error("Event Id Invalid");
//     }
//   }
// });

export const updatePass = new ValidatedMethod({
  name: "Pass.methods.update",
  validate: null,
  run(passUpdate) {
    if(Roles.userIsInRole(this.userId, 'gift-list')) {
      console.log(passUpdate);
      PassportBookings.update(passUpdate.checkId, {
  $set: passUpdate
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});


// export const deleteGift = new ValidatedMethod({
//   name: "Gifts.methods.delete",
//   validate: null,
//   run(id) {
//     if(Roles.userIsInRole(this.userId, 'gift-list')) {
//       Gifts.remove({
//   _id: id
//       });
//     }
//     else {
//       throw new Meteor.Error("NO PERMISSIONS");
//     }
//   }
// });

export const bookPassports = new ValidatedMethod({
  name: "Passports.methods.assign",
  validate: PassportBookingSchema.validator( { clean: true }),
  run(booking) {
    var eventId = booking.eventId;
    

    var event = Events.findOne({
      _id: eventId
    });


    var guest = Guests.findOne({
      _id: booking.guestId
    });

    if(event && guest) {
      var alreadyBooked = PassportBookings.findOne({
  eventId: eventId,
  guestId: booking.guestId
      });

     if(alreadyBooked) {
  throw new Meteor.Error("Already booked");
      }
      else {
  PassportBookings.insert(booking);
      }
    }
    else {
      throw new Meteor.Error("Invalid data");
    }
  }
});