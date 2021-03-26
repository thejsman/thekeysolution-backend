import { Mongo } from 'meteor/mongo';

export const Notifications = new Mongo.Collection('appnotifications');
export const GuestNotificationList = new Mongo.Collection('guestnotificationlist');
