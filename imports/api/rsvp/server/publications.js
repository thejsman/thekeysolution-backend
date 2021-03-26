// Time-stamp: 2017-10-10 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------

import { Meteor } from 'meteor/meteor';
import { RSVP } from '../rsvp.js';

Meteor.publish('rsvp.guest', function({guestId, eventId}) {
  return RSVP.find({
    guestId,
    eventId
  });
});
