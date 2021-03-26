// Time-stamp: 2017-08-11 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : guestCount.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Mongo } from 'meteor/mongo';

export const GuestCount = new Mongo.Collection('guestcount');
export const FamilyCount = new Mongo.Collection('familycount');
