import { Meteor } from 'meteor/meteor';
import { Notifications, GuestNotificationList } from '../notifications.js';
import { Guests } from '../../guests/guests.js';

Meteor.publish('notifications.event', function(eventId) {
  return Notifications.find({ eventId });
});

Meteor.publish('guest.notifications', function ({ eventId, guestId }) {

  let guest = Guests.findOne(guestId);

  if(!guest) return [];

  let loginTime = guest.appLoginTime ? guest.appLoginTime : Date.now();

  return GuestNotificationList.find({
    $or: [
      {
  guestId, eventId, sentToAll: false
      },
      {
  eventId, sentToAll: true
      }
    ],
    time: {
      $gt: loginTime
    }
  });
});


Meteor.publish('guest.notification.count', function({ eventId, guestId }) {
  let initializing = true;

  let guest = Guests.findOne(guestId);

  if(!guest) throw new Meteor.Error(403, "Guest not found");

  let loginTime = guest.appLoginTime ? guest.appLoginTime : Date.now();
  let notifications = GuestNotificationList.find({
    $or: [
      {
        guestId, eventId, sentToAll: false
      },
      {
        eventId, sentToAll: true
      }
    ],
    time: {
      $gt: loginTime
    }
  });

  const handle = notifications.observeChanges({
    added: (id) => {
      if (!initializing) {
        this.changed('notificationCount', guestId, { count : notifications.count() });
      }
    },

    removed: (id) => {
      this.changed('notificationCount', guestId, { count : notifications.count() });
    }
  });

  initializing = false;
  this.added('notificationCount', guestId, { count: notifications.count() } );
  this.ready();
  this.onStop(() => handle.stop());
});
