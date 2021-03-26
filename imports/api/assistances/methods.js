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
import { AssistanceSchema } from './schema.js';
import { AssistanceBookingSchema } from './schema.js';
import { Assistances } from './assistances.js';
import { Guests } from '../guests/guests.js';
import { AssistanceBookings } from './assistanceBooking.js';
import { Events } from '../events/events.js';

export const insertAssistance = new ValidatedMethod({
  name: "Assistances.methods.insert",
  validate: AssistanceSchema.validator( { clean: true }),
  run(assistanceNew) {
    var event = Events.findOne({
      _id: assistanceNew.eventId
    });

    assistanceNew.available = assistanceNew.assistanceQuantity;

    if(event) {
      Assistances.insert(assistanceNew);
    }
    else {
      throw new Meteor.Error("Event Id Invalid");
    }
  }
});

export const updateassistance = new ValidatedMethod({
  name: "Assistances.methods.update",
  validate: AssistanceSchema.validator({ clean: true }),
  run(assistanceUpdate) {
    if(Roles.userIsInRole(this.userId, 'assistance-list')) {
      console.log('huqi')
      console.log(assistanceUpdate.assistanceOption1)
      Assistances.update(assistanceUpdate.eventId, {
  $set: assistanceUpdate
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});
