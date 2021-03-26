// Time-stamp: 2017-08-02 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/meteor-roles';
import { Airports } from '../airports.js';

Meteor.publish('airports.all', function(id) {
  return Airports.find({});
});
