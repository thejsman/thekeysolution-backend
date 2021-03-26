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
import { Airlines } from '../airlines.js';

Meteor.publish('airlines.all', function(id) {
  return Airlines.find({});
});

Meteor.publish('airlines.select', function(s) {
  if(!s || s==="") {
    return Airlines.find({});
  }
  else {
    return Airlines.find({
      airlineName: {
	$regex: "/^"+s+"/"
      }
    });
  }
});
