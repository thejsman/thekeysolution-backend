import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router'
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { Guests } from '../../../../api/guests/guests.js';
import { updateRoomPreferences } from '../../../../api/preferences/methods.js';
import { RoomPreferenceSchema } from '../../../../api/preferences/schema.js';
import './events_guest_profile_room_preference.html';

Template.events_guest_room_preference.helpers({
  roomPreferencesInfo() {
    let guestId = FlowRouter.getParam("guestId");
    let guest = Guests.findOne(guestId);
    if(!guest || !guest.roomPreferences) {
      return RoomPreferenceSchema.clean({});
    }
    return guest.roomPreferences;
  }
});

Template.events_guest_room_preference.events({
  'submit #guest-room-preference'(event, template) {
    event.preventDefault();
    let data = template.$(event.target).serializeObject();
    data.guestId = FlowRouter.getParam("guestId");
    updateRoomPreferences.call(data, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("Updated Room Preferences");
      }
    });
  }
});
