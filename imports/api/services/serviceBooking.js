import { Mongo } from 'meteor/mongo';

export const serviceBookings = new Mongo.Collection('servicebookings');

export const ServiceBookings = new Mongo.Collection('servicebookings2');
