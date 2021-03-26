// Time-stamp: 2017-08-02 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : airports.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Mongo } from 'meteor/mongo';

export const Airports =  new Mongo.Collection('airportslist');
