// Fill the DB with example data on startup

import { Meteor } from 'meteor/meteor';
import { generateAccounts } from '../../api/adminusers/server/createSuperAdmins.js';
import { DraftEvents } from '../../api/draftevents/draftevents.js';
import { Events } from '../../api/events/events.js';
import { Guests } from '../../api/guests/guests.js';
import { App_General } from '../../api/app_general/app_general.js';
import { Rooms } from '../../api/hotels/rooms.js';
import { ChatRequests } from '../../api/chat/chat.js';

Meteor.startup(() => {
  generateAccounts();
  // Guests.remove({});
  // DraftEvents.remove({});
  // Events.remove({});
  // Rooms.remove({});
  // ChatRequests.update({
  //   status: {
  //     $exists: false
  //   }
  // }, {
  //   $set: {
  //     status: 'asked'
  //   }
  // }, { multi: true });
});
