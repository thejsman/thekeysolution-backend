import SimpleSchema from 'simpl-schema';

export const ChatMessageSchema = new SimpleSchema({
  eventId: String,
  senderId: String,
  senderName: String,
  receiverId: String,
  receiverName: String,
  message: String,
  timestamp: Number,
  read: Boolean
});
