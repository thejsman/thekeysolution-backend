import admin from 'firebase-admin';
import { Events } from '../../events/events.js';
import { GuestNotificationList } from '../notifications.js';

export const sendNotificationToEvent = (eventId, msg, guests) => {
  console.log('This is meteor server notifications ... ');
  let payload = {
    notification: {
      title: msg.notificationTitle,
      body: msg.notificationDescription
    }
  };
  let options = { priority: "high" };
  let cb = res => console.log(JSON.stringify(res));
  let ercb = er => console.log(er);
  if (msg.notificationUserList && msg.notificationUserList.length > 0) {
    let tokens = guests.map(g => {
      GuestNotificationList.insert({
        eventId,
        sentToAll: false,
        guestId: g._id,
        time: Date.now(),
        ...payload.notification
      });
      return g.fcmToken;
    });
    admin.messaging().sendToDevice(tokens, payload, options).then(cb).catch(ercb);
  }
  else {
    let event = Events.findOne(eventId);
    admin.messaging().sendToTopic(`event-${eventId}`, payload, options).then(cb).catch(ercb);
    let id = GuestNotificationList.insert({
      eventId,
      time: Date.now(),
      sentToAll: true,
      ...payload.notification
    });
    console.log(id);
  }
};

export const sendChatNotification = (msg, guestToken, guestName) => {
  let payload = {
    notification: {
      title: guestName,
      body: msg
    }
  };
  admin.messaging().sendToDevice(guestToken, payload, { priority: 'high' }).then(console.log).catch(console.log);
};
