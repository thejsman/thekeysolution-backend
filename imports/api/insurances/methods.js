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
import { InsuranceSchema } from './schema.js';
import { InsuranceBookingSchema } from './schema.js';
import { Insurances } from './insurances.js';
import { Guests } from '../guests/guests.js';
import { InsuranceBookings } from './insuranceBooking.js';
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

// export const updateGift = new ValidatedMethod({
//   name: "Gifts.methods.update",
//   validate: GiftSchema.validator({ clean: true }),
//   run(giftUpdate) {
//     if(Roles.userIsInRole(this.userId, 'gift-list')) {
//       Gifts.update(giftUpdate.giftId, {
//   $set: giftUpdate
//       });
//     }
//     else {
//       throw new Meteor.Error("NO PERMISSIONS");
//     }
//   }
// });


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

export const updateIns = new ValidatedMethod({
  name: "insurance.methods.update",
  validate: null,
  run(insuranceUpdate) {
    if(Roles.userIsInRole(this.userId, 'gift-list')) {
      console.log(insuranceUpdate);
      InsuranceBookings.update(insuranceUpdate.checkId, {
  $set: insuranceUpdate
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

export const bookInsurances = new ValidatedMethod({
  name: "Insurances.methods.assign",
  validate: InsuranceBookingSchema.validator( { clean: true }),
  run(booking) {
    var eventId = booking.eventId;
    

    var event = Events.findOne({
      _id: eventId
    });


    var guest = Guests.findOne({
      _id: booking.guestId
    });

    if(event && guest) {
      var alreadyBooked = InsuranceBookings.findOne({
  eventId: eventId,
  guestId: booking.guestId
      });

     if(alreadyBooked) {
  throw new Meteor.Error("Already booked");
      }
      else {
  InsuranceBookings.insert(booking);
      }
    }
    else {
      throw new Meteor.Error("Invalid data");
    }
  }
});