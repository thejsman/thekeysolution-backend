import { Mongo } from 'meteor/mongo';

export const EventPackages =  new Mongo.Collection('event_packages');
export const EventPackageInfo =  new Mongo.Collection('event_packages_info');
