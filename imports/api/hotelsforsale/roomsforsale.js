import { Mongo } from 'meteor/mongo';

export const Rooms  = new Mongo.Collection('hotelforsalerooms');

export const RoomCount = new Mongo.Collection('hotelforsaleroomscount');
