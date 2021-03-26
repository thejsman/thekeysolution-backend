import { Meteor } from 'meteor/meteor';
import { Chat, ChatRequests } from '../chat.js';

Meteor.publish('guest.chat', function({guestId}) {
  return [Chat.find({
    receiverId: guestId
  }), ChatRequests.find({
    $or: [
      {
	senderId: guestId
      },
      {
	receiverId: guestId
      }
    ]
  })];
});
