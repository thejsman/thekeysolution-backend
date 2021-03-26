import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { FoodPreferences } from './foodpreference.js';
import { SizePreferences } from './sizepreference.js';
import { SpecialAssistancePreferences } from './specialassistancepreference.js';
import { FoodPreferenceSchema, SizePreferenceSchema, GuestPreferencesSchema, RoomPreferenceSchema, SpecialAssistancePreferenceSchema } from './schema.js';
import { Guests } from '../guests/guests.js';
import { Events } from '../events/events.js';
import { insertActivity } from '../../api/activity_record/methods.js';

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

export const updateEventFoodPreferences = new ValidatedMethod({

  name: "Event.preferences.food.update",
  validate: FoodPreferenceSchema.validator(),
  run(foodPreference) {
    FoodPreferences.upsert({
      eventId: foodPreference.eventId
    }, {
        $set: foodPreference
      });
  }
});

export const updateEventSizePreferences = new ValidatedMethod({
  name: "Event.preferences.size.update",
  validate: SizePreferenceSchema.validator(),
  run(sizePreference) {
    SizePreferences.upsert({
      eventId: sizePreference.eventId
    }, {
        $set: sizePreference
      });
  }
});

export const updateSpecialAssistancePreferences = new ValidatedMethod({
  name: "Event.preferences.specialassistance.update",
  validate: SpecialAssistancePreferenceSchema.validator(),
  run(specialPreference) {
    SpecialAssistancePreferences.upsert({
      eventId: specialPreference.eventId
    }, {
      $set: specialPreference
    });
  }
});

export const updateGuestPreferences = new ValidatedMethod({
  name: "Guest.preferences.update",
  validate: GuestPreferencesSchema.validator(),
  run(prefs) {
    Guests.update(prefs.guestId, {
      $set: prefs
    });

    //code to insert data in Activity Record
    let guests = Guests.findOne(prefs.guestId);

    activityInsertData = {
      eventId: guests.eventId,
      activityModule: 'Guests',
      activitySubModule: 'Guest Preference',
      event: 'update',
      activityMessage: 'Guest prefernece is updated for ' + guests.guestTitle + ' ' + guests.guestFirstName + ' ' + guests.guestLastName + '.'
    }
    activityRecordInsert(activityInsertData);
  }
});

export const updateRoomPreferences = new ValidatedMethod({
  name: "Guest.roompreferences.update",
  validate: RoomPreferenceSchema.validator({ clean: true }),
  run(roomPref) {
    Guests.update(roomPref.guestId, {
      $set: {
        roomPreferences: roomPref
      }
    });

    //code to insert data in Activity Record
    let guests = Guests.findOne(roomPref.guestId);
    activityInsertData = {
      eventId: guests.eventId,
      activityModule: 'Guests',
      activitySubModule: 'Room Preference',
      event: 'update',
      activityMessage: 'Room prefernece is updated for ' + guests.guestTitle + ' ' + guests.guestFirstName + ' ' + guests.guestLastName + '.'
    }
    activityRecordInsert(activityInsertData);
  }
});
