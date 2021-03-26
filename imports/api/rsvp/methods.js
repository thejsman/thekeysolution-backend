import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { RSVPSchema, InviteGuestSchema } from './schema.js';
import { RSVP } from './rsvp.js';
import { Events } from '../events/events.js';
import { Guests } from '../guests/guests.js';
import { insertActivity } from '../../api/activity_record/methods.js';

import _ from 'lodash';

//code to insert data in Activity Record
function activityRecordInsert(data) {
  var activityEvent = '';
  var activityEventId = '';
  var activityUserInfo = {
    id: Meteor.userId(),
    name: Meteor.user().profile.name,
    email: Meteor.user().emails[0].address,
  }
  if (data.eventId == null || data.eventId == '' || data.eventId == undefined) {
    activityEvent = 'general';
    activityEventId = 'general';
  }
  else {
    var event = Events.findOne(data.eventId);
    activityEvent = event.basicDetails.eventName;
    activityEventId = event._id;
  }
  var date = new Date();
  userdata = {
    activityeDateTime: date, //date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+'.'+date.getMilliseconds(),
    activityUserInfo: activityUserInfo,
    activityModule: data.activityModule,
    activitySubModule: data.activitySubModule,
    activityEvent: activityEvent,
    activityEventId: activityEventId,
    activityMessage: data.activityMessage,

  }
  insertActivity.call(userdata, (err, res) => {
    if (err) {
      console.log('Insert Activity record Error :: ', err);
      return 0;
    }
    else {
      return true;
    }
  });
};

export const updateInvitation = new ValidatedMethod({
  name: 'Invites.methods.update',
  validate: InviteGuestSchema.validator(),
  run({ guestId, subevents }) {
    Guests.update(guestId, {
      $set: {
        inviteStatus: subevents
      }
    });

    //code to insert data in Activity Record
    // let guests = Guests.findOne(guestId);
    // activityInsertData = {
    //   eventId: guests.eventId,
    //   activityModule: 'Guests',
    //   activitySubModule: 'Invitation',
    //   event: 'update',
    //   activityMessage: 'Invitation is updated for ' + guests.guestTitle + ' ' + guests.guestFirstName + ' ' + guests.guestLastName + '.'
    // }
    // activityRecordInsert(activityInsertData);

  }
});

export const updateRSVP = new ValidatedMethod({
  name: 'RSVP.methods.update',
  validate: RSVPSchema.validator(),
  run({ eventId, guestId, subevents }) {
    var event = Events.findOne(eventId);
    var guest = Guests.findOne(guestId);
    if (!event || !guest) {
      throw new Meteor.Error("Invalid data");
    }

    _.each(subevents, (sub) => {
      let subEventId = sub.subEventId;
      RSVP.upsert({
        eventId,
        guestId,
        subEventId
      }, {
          $set: {
            status: sub.status
          }
        });
    });
  }
});
