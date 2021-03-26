import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { SubEvents } from './subevents.js';
import { SubEventBookings } from './subeventsbookings.js';
import { SubEventSchema } from './schema.js';
import { Events } from '../events/events.js';
import { Random } from 'meteor/random';
import { Guests } from '../guests/guests.js';
import _ from 'lodash';

let isAllowed = (userId, role) => {
  let scopes = Roles.getScopesForUser(userId);
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

export const insertSubevent = new ValidatedMethod({
  name: "SubEvents.methods.insert",
  validate: SubEventSchema.validator({ clean: true }),
  run(subeventNew) {
    // ABL_SAM added Permission Check
    subeventNew._id = Random.id();
    if (!isAllowed(this.userId, 'subevents-add')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    var event = Events.findOne({
      _id: subeventNew.eventId
    });
    
    if (event) {
      Guests.update({eventId: subeventNew.eventId},{
        $addToSet: {
          inviteStatus : {
            subEventId: subeventNew._id,
            status: true
          }
        }
      },{multi : true})
      SubEvents.insert(subeventNew);
    }
    else {
      throw new Meteor.Error("Event Id Invalid");
    }
  }
});


export const updateSubevent = new ValidatedMethod({
  name: "SubEvents.methods.update",
  validate: SubEventSchema.validator({ clean: true }),
  run(subeventUpdate) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, 'subevents-edit')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    SubEvents.update(subeventUpdate.subeventId, {
      $set: subeventUpdate
    });
  }
});


export const deleteSubevent = new ValidatedMethod({
  name: "SubEvents.methods.delete",
  validate: null,
  run(id) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, 'subevents-delete')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    SubEvents.remove({
      _id: id
    });
  }
});

export const bookSubEvent = new ValidatedMethod({
  name: "SubEvents.methods.book",
  validate: null,
  run({ guestId, subeventId, state }) {
    SubEventBookings.upsert({
      guestId: guestId,
      subEventId: subeventId
    }, {
        $set: {
          state: state
        }
      });
  }
});

export const rsvpSubEvents = new ValidatedMethod({
  name: "SubEvents.list.rsvp",
  validate: null,
  run(eventId) {
    let event = Events.findOne(eventId);
    let subs = SubEvents.find({eventId : eventId}).fetch();
    let sortingType = event && event.basicDetails.eventSubeventSorting;
    let val = [];
    switch (sortingType) {
      case 'subevent':
        val = _.groupBy(subs, '_id');
        break;
      case 'date':
        val = _.groupBy(subs, 'subEventDate');
        break;
      case 'destination':
        val = _.groupBy(subs, 'subEventDestination');
        break;
      default:
        break;
    }
    if(sortingType == 'subevent'){
      return {
        single : true,
        data : val
      }
    } else {
      return {
        single : false,
        data : val
      }
    }
  }
});