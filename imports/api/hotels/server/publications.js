// Time-stamp: 2017-06-22
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : publications.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Meteor } from "meteor/meteor";
import { Hotels } from "../hotels.js";
import { HotelBookings } from "../hotelBookings.js";
import { Rooms } from "../rooms.js";
import { Guests } from "../../guests/guests.js";

Meteor.publish("rooms.event", function(id) {
  return Rooms.find({
    eventId: id
  });
});

Meteor.publish("hotelbookings.byRoomId", function(roomId) {
  return HotelBookings.find({
    roomId
  });
});

Meteor.publish("hotels.all", function(id) {
  let hotels = Hotels.find({
    eventId: id
  });

  return hotels;
});

Meteor.publish("hotels.one", function(id) {
  let rooms = Rooms.find({ hotelId: id });

  return [
    Hotels.find({
      _id: id
    }),
    rooms
  ];
});

Meteor.publish("room.guests.names", function(guestIds) {
  if (!guestIds || !guestIds.length) {
    return null;
  }
  let guests = Guests.find(
    {
      _id: {
        $in: guestIds
      }
    },
    {
      fields: {
        guestFirstName: 1,
        _id: 1,
        folioNumber: 1
      }
    }
  );
  return guests;
});

Meteor.publish("hotelbookings.all", function(eventId) {
  return HotelBookings.find({
    eventId: eventId
  });
});

Meteor.publish("hotelbookings.guest", function(guestId) {
  let guest = Guests.findOne(guestId);
  if (!guest) {
    return null;
  }
  let guestFamilyID = guest.guestFamilyID;
  let guests = Guests.find({ guestFamilyID }).map(g => g._id);

  return [
    HotelBookings.find({
      guestId: {
        $in: guests
      }
    })
  ];
});

Meteor.publish("hotels.bookedRooms.all", function(roomId) {
  if (!roomId) return [];
  return HotelBookings.find({ roomId });
});

Meteor.publish("hotel.bookedRooms.byHotelId", function(hotelId) {
  const bookings = HotelBookings.find({ hotelId });
  return bookings;
});

Meteor.publish("hotel.rooms.byHotelId", function(hotelId) {
  const rooms = Rooms.find({ hotelId });
  return rooms;
});
