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
import { SizeSchema } from './schema.js';
import { SizeBookingSchema } from './schema.js';
import { Sizes } from './sizes.js';
import { Guests } from '../guests/guests.js';
import { SizeBookings } from './sizeBooking.js';
import { Events } from '../events/events.js';

export const insertSize = new ValidatedMethod({
  name: "Sizes.methods.insert",
  validate: SizeSchema.validator( { clean: true }),
  run(sizeNew) {
    var event = Events.findOne({
      _id: sizeNew.eventId
    });

    sizeNew.available = sizeNew.sizeQuantity;

    if(event) {
      Sizes.insert(sizeNew);
    }
    else {
      throw new Meteor.Error("Event Id Invalid");
    }
  }
});

export const updateSize = new ValidatedMethod({
  name: "Sizes.methods.update",
  validate: SizeSchema.validator({ clean: true }),
  run(sizeUpdate) {
    if(Roles.userIsInRole(this.userId, 'size-list')) {
      console.log('huqi')
      console.log(sizeUpdate.sizeOption1)
      Sizes.update(sizeUpdate.eventId, {
        $set: sizeUpdate
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});


// export const deletesize = new ValidatedMethod({
//   name: "sizes.methods.delete",
//   validate: null,
//   run(id) {
//     if(Roles.userIsInRole(this.userId, 'size-list')) {
//       sizes.remove({
//   _id: id
//       });
//     }
//     else {
//       throw new Meteor.Error("NO PERMISSIONS");
//     }
//   }
// });

// export const bookGifts = new ValidatedMethod({
//   name: "Gifts.methods.assign",
//   validate: GiftBookingSchema.validator( { clean: true }),
//   run(booking) {
//     var eventId = booking.eventId;
//     var giftId = booking.giftId;

//     var event = Events.findOne({
//       _id: eventId
//     });

//     var gifts = Gifts.findOne({
//       _id: giftId
//     });

//     var guest = Guests.findOne({
//       _id: booking.guestId
//     });

//     if(event && gifts && guest) {
//       var alreadyBooked = GiftBookings.findOne({
//   eventId: eventId,
//   guestId: booking.guestId
//       });

//      if(alreadyBooked) {
//   throw new Meteor.Error("Already booked");
//       }
//       else {
//   GiftBookings.insert(booking);
//       }
//     }
//     else {
//       throw new Meteor.Error("Invalid data");
//     }
//   }
// });
