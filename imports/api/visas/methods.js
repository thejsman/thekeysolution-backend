import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { VisaSchema } from './schema.js';
import { VisaBookingSchema } from './schema.js';
import { Visas } from './visas.js';
import { Guests } from '../guests/guests.js';
import { VisaBookings } from './visaBooking.js';
import { Events } from '../events/events.js';

export const updateVisa = new ValidatedMethod({
  name: "visa.methods.update",
  validate: null,
  run(visaUpdate) {
    if(Roles.userIsInRole(this.userId, 'gift-list')) {
      console.log(visaUpdate);
      VisaBookings.update(visaUpdate.checkId, {
        $set: visaUpdate
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

export const bookVisas = new ValidatedMethod({
  name: "Visas.methods.assign",
  validate: VisaBookingSchema.validator( { clean: true }),
  run(booking) {
    var eventId = booking.eventId;
    var event = Events.findOne({
      _id: eventId
    });

    var guest = Guests.findOne({
      _id: booking.guestId
    });

    if(event && guest) {
      var alreadyBooked = VisaBookings.findOne({
        eventId: eventId,
        guestId: booking.guestId
      });

      if(alreadyBooked) {
        throw new Meteor.Error("Already booked");
      }
      else {
        VisaBookings.insert(booking);
      }
    }
    else {
      throw new Meteor.Error("Invalid data");
    }
  }
});