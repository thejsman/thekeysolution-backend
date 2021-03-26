import { Mongo } from 'meteor/mongo';
export const Chat = new Mongo.Collection('chat');
export const ChatRequests = new Mongo.Collection('chatrequests');
