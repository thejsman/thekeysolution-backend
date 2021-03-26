// Time-stamp: 2017-07-31 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : services.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Mongo } from 'meteor/mongo';

export const Services = new Mongo.Collection('services');
export const ServiceSlots = new Mongo.Collection('serviceslots');
