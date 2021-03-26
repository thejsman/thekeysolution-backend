// Time-stamp: 2017-06-22
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { Hotelsforsale as Hotels} from '../hotelsforsale.js';
import { HotelforsaleBookings as HotelBookings} from '../hotelforsaleBookings.js';
import { Rooms } from '../roomsforsale.js';
import { Guests } from '../../guests/guests.js';

Meteor.publish('hotelsforsale.all', function(id) {
  let hotels = Hotels.find({
    eventId: id
  });

  return hotels;
});

Meteor.publish('hotelsforsale.one', function(id) {

  let rooms = Rooms.find({hotelId: id});

  return [Hotels.find({
    _id: id
  }), rooms];
});

Meteor.publish('roomforsale.guests.names', function(guestIds) {
  let guests =  Guests.find({
    _id: {
      $in: guestIds
    }
  }, {
    fields: {
      guestFirstName: 1,
      _id: 1
    }
  });
  return guests;
});


Meteor.publish('hotelforsalebookings.all', function(eventId) {
  return HotelBookings.find({
    eventId: eventId
  });
});

Meteor.publish('hotelforsalebookings.guest', function(guestId) {
  let guest = Guests.findOne(guestId);
  if(!guest) {
    return null;
  }
  let guestFamilyID = guest.guestFamilyID;
  let guests = Guests.find({ guestFamilyID }).map(g => g._id);

  return [HotelBookings.find({
    guestId: {
      $in: guests
    }
  })];
});

Meteor.publish('hotelsforsale.room', function(hotelRoomId) {
  return Rooms.find({hotelRoomId});
});

Meteor.publish('hotelsforsale.rooms.all', function(hotelId) {
  return Rooms.find({ hotelId });
});
