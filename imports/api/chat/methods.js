import { Meteor } from 'meteor/meteor';
import { Chat, ChatRequests } from './chat.js';
import { Guests } from '../guests/guests.js';

import { ChatMessageSchema } from './schema.js';
import { GuestNotificationList } from '../notifications/notifications.js';

Meteor.methods({
  'guest.sendMessage'(data) {
    data.read = false;
    data.timestamp = Date.now();

    let guest = Guests.findOne({
      _id: data.senderId
    });

    let sendToGuest = Guests.findOne(data.receiverId);

    if(!guest || !sendToGuest) {
      throw new Meteor.Error("COULD NOT FIND GUEST");
    }
    data.eventId = guest.eventId;
    ChatMessageSchema.validate(data, { clean : true });
    Chat.insert(data);
    if(Meteor.isServer && sendToGuest.chatActive !== false && sendToGuest.fcmToken) {
      require('../notifications/server/sendNotification.js').sendChatNotification(data.message, sendToGuest.fcmToken, guest.guestFirstName);
    }
  },

  'guest.chat.request.update'({requestId, status}) {
    let request = ChatRequests.findOne(requestId);
    ChatRequests.remove(requestId);
    ChatRequests.insert({
      senderId: request.senderId,
      receiverId: request.receiverId,
      status
    });
    let sender = Guests.findOne(request.senderId);
    let receiver = Guests.findOne(request.receiverId);
    if(Meteor.isServer && sender.chatActive !== false && sender.fcmToken) {
      require('../notifications/server/sendNotification.js').sendChatNotification(`${receiver.guestFirstName} has ${status} your chat request`, sender.fcmToken, receiver.guestFirstName);

      GuestNotificationList.insert({
	eventId: sender.eventId,
	guestId: sender._id,
	sentToAll: false,
	time: Date.now(),
	title: receiver.guestFirstName,
	body: `${receiver.guestFirstName} has ${status} your chat request`
      });
    }
  },

  'guest.chat.request'({ senderId, receiverId }) {
    let guest = Guests.findOne(senderId);
    let sendToGuest = Guests.findOne(receiverId);

    if(!guest || !sendToGuest) {
      throw new Meteor.Error("COULD NOT FIND GUEST");
    }


    let already = ChatRequests.findOne({
      $or: [
	{ senderId, receiverId },
	{ senderId: receiverId, receiverId: senderId }
      ]
    });

    if(already) {
      return false;
    }

    ChatRequests.insert({ senderId, receiverId , status: 'asked'});

    if(Meteor.isServer && sendToGuest.chatActive !== false && sendToGuest.fcmToken) {
      require('../notifications/server/sendNotification.js').sendChatNotification(`${guest.guestFirstName} wants to chat`, sendToGuest.fcmToken, guest.guestFirstName);
      GuestNotificationList.insert({
	eventId: guest.eventId,
	guestId: sendToGuest._id,
	sentToAll: false,
	time: Date.now(),
	title: guest.guestFirstName,
	body: `${guest.guestFirstName} wants to chat`
      });
    }

    return true;
  },

  'guest.receivedMessages'({ guestId, idList }) {
    Chat.remove({
      _id: {
	$in: idList
      },
      receiverId: guestId
    });
  },

  'guest.chat.toggle'({ guestId, active }) {
    Guests.update(guestId, {
      $set: {
	chatActive: active
      }
    });
  },


  'guest.search'({eventId, guestId, name}) {
    console.log(eventId, guestId, name);

    let guests = Guests.find({
      eventId,
      _id: { $ne: guestId },
      guestIsPrimary:true,
      guestFirstName: { $regex: `^${name}`, $options: 'i' }
    }, {
      fields: {
	_id: 1,
	guestFirstName: 1,
	guestLastName: 1
      }
    });

    return guests.fetch();
  },
  'guest.chat'({guestId}){
    return [Chat.find({  
      $or: [
      {
        senderId: guestId
      },
      {
        receiverId: guestId
      }
    ]
  }).fetch(), ChatRequests.find({
    $or: [
      {
        senderId: guestId
      },
      {
        receiverId: guestId
      }
    ]
  }).fetch()];
  }
});
