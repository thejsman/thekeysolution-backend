// Time-stamp: 2017-07-31
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { Services, ServiceSlots } from '../services.js';

Meteor.publish('service.slots', (serviceId) => {
  return ServiceSlots.find({
    serviceId,
    available: {
      $ne: false
    }
  });
});

Meteor.publish('services.event', function(eventId) {
  return Services.find({ eventId });
});

Meteor.publish('services.one', function(id) {
  return Services.find({
    _id: id
  });
});
