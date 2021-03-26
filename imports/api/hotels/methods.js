import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Events } from "../events/events.js";
import { Hotels } from "./hotels.js";
import { Roles } from "meteor/meteor-roles";

import { Rooms, RoomCount } from "./rooms.js";
import { HotelBookings } from "./hotelBookings.js";
import {
  HotelSchema,
  HotelRoomSchema,
  HotelReserveSchema,
  HotelBookSchema,
  HotelRoomUpdateSchema,
  HotelRoomRemarksUpdateSchema
} from "./schema.js";
import { Guests } from "../guests/guests.js";
import { insertActivity } from "../../api/activity_record/methods.js";
import _ from "lodash";

let isAllowed = (userId, role) => {
  let scopes = Roles.getScopesForUser(userId);
  if (scopes.length > 0) {
    for (var i = 0; i < scopes.length; i++) {
      if (Roles.userIsInRole(userId, role, scopes[i])) {
        return true;
      }
    }
    return false;
  }
  return Roles.userIsInRole(userId, role);
};
//code to insert data in Activity Record
function activityRecordInsert(data) {
  var activityEvent = "";
  var activityEventId = "";
  var activityUserInfo = {
    id: Meteor.userId(),
    name: Meteor.user().profile.name,
    email: Meteor.user().emails[0].address
  };
  if (data.eventId == null || data.eventId == "" || data.eventId == undefined) {
    activityEvent = "general";
    activityEventId = "general";
  } else {
    var event = Events.findOne(data.eventId);
    activityEvent = event.basicDetails.eventName;
    activityEventId = event._id;
  }
  var date = new Date();
  userdata = {
    activityeDateTime: date, //date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+'.'+date.getMilliseconds(),
    activityUserInfo: activityUserInfo,
    activityModule: data.activityModule,
    activitySubModule: data.activitySubModule,
    activityEvent: activityEvent,
    activityEventId: activityEventId,
    activityMessage: data.activityMessage
  };
  insertActivity.call(userdata, (err, res) => {
    if (err) {
      return 0;
    } else {
      return true;
    }
  });
}

export const insertHotel = new ValidatedMethod({
  name: "Hotels.methods.insert",
  validate: HotelSchema.validator({ clean: true }),
  run(newHotel) {
    var event = Events.findOne({
      _id: newHotel.eventId
    });

    if (event) {
      return Hotels.insert(newHotel);
    } else {
      throw new Meteor.Error("Event Id Invalid");
    }
  }
});

export const updateHotel = new ValidatedMethod({
  name: "Hotels.methods.update",
  validate: HotelSchema.validator({ clean: true }),
  run(hotelInfo) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, "edit-hotels")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    Hotels.update(hotelInfo.hotelId, {
      $set: hotelInfo
    });
  }
});

export const addHotelRooms = new ValidatedMethod({
  name: "Hotels.methods.addRoom",
  validate: HotelRoomSchema.validator({ clean: true }),
  run(newRoom) {
    let event = Events.findOne(newRoom.eventId);
    let hotel = Hotels.findOne(newRoom.hotelId);
    if (event && hotel) {
      const r = Rooms.insert(newRoom);
      return r;
    } else {
      throw new Meteor.Error("Event or hotel not found");
    }
  }
});

export const removeHotelRooms = new ValidatedMethod({
  name: "Hotels.methods.removeRoom",
  validate: null,
  run(info) {
    Rooms.remove(info._id);
    HotelBookings.remove({
      roomId: info._id
    });
  }
});

export const updateHotelRoom = new ValidatedMethod({
  name: "Hotels.methods.udpateRoom",
  validate: HotelRoomSchema.validator({ clean: true }),
  run(roomData) {
    let event = Events.findOne(roomData.eventId);
    let hotel = Hotels.findOne(roomData.hotelId);
    if (event && hotel) {
      const r = Rooms.update(roomData.id, {
        $set: { ...roomData }
      });
      return r;
    }
  }
});

export const removeHotel = new ValidatedMethod({
  name: "Hotels.methods.remove",
  validate: null,
  run(hotelId) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, "delete-hotels")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    Hotels.remove(hotelId);
    HotelBookings.remove({ hotelId });
    Rooms.remove({ hotelId });
  }
});

export const reserveHotel = new ValidatedMethod({
  name: "Hotels.methods.reserve",
  validate: HotelReserveSchema.validator({ clean: true }),
  run(reservation) {
    var hotel = Hotels.findOne({
      _id: reservation.hotelId
    });
    if (!hotel) {
      throw new Meteor.Error("Hotel not found");
    }

    Hotels.update(
      {
        _id: reservation.hotelId,
        "hotelRoomDetails._id": reservation.hotelRoomId
      },
      {
        $inc: {
          "hotelRoomDetails.$.hotelReservedRooms": reservation.hotelRooms
        }
      }
    );
  }
});

export const UpdateRoomNumber = new ValidatedMethod({
  name: "Hotels.methods.updateRoom",
  validate: HotelRoomUpdateSchema.validator({ clean: true }),
  run(booking) {
    let reservation = HotelBookings.findOne(booking.bookingId);
    if (!reservation) {
      throw new Meteor.Error("Cannot find booking to update");
    }
    HotelBookings.update(
      {
        hotelId: reservation.hotelId,
        roomId: reservation.roomId
      },
      {
        $set: {
          hotelRoomNumber: booking.roomNumber
        }
      },
      {
        multi: true
      }
    );

    Rooms.update(reservation.roomId, {
      $set: {
        hotelRoomNumber: booking.roomNumber
      }
    });
    //code to store activity log
    let guests = Guests.findOne(reservation.guestId);

    activityInsertData = {
      eventId: guests.eventId,
      activityModule: "Guests",
      activitySubModule: "Hotel Room",
      event: "update",
      activityMessage:
        "Room Number for guest " +
        guests.guestTitle +
        " " +
        guests.guestFirstName +
        " " +
        guests.guestLastName +
        " is updated."
    };
    activityRecordInsert(activityInsertData);
  }
});

export const UpdateRoomRemarks = new ValidatedMethod({
  name: "Hotels.methods.updateRoomRemarks",
  validate: HotelRoomRemarksUpdateSchema.validator({ clean: true }),
  run(booking) {
    let reservation = HotelBookings.findOne(booking.bookingId);
    if (!reservation) {
      throw new Meteor.Error("Cannot find booking to update");
    }
    let room = Rooms.find(reservation.roomId);

    HotelBookings.update(
      {
        hotelId: reservation.hotelId,
        hotelRoomId: reservation.hotelRoomId
      },
      {
        $set: {
          hotelRoomRemarks: booking.roomRemarks
        }
      },
      {
        multi: true
      }
    );

    Rooms.update(reservation.roomId, {
      $set: {
        hotelRoomRemarks: booking.roomRemarks
      }
    });
  }
});

export const clearBookingData = new ValidatedMethod({
  name: "Hotels.methods.clearBooking",
  validate: null,
  run(eventId) {
    return HotelBookings.remove({ eventId });
  }
});

export const bookRoom = new ValidatedMethod({
  name: "Hotels.methods.book",

  validate: HotelBookSchema.validator({ clean: true }),
  run(booking) {
    const guest = booking.guestId ? Guests.findOne(booking.guestId) : null;
    const hotel = Hotels.findOne(booking.hotelId);

    if (!hotel || !hotel.eventId) {
      throw new Meteor.Error("Guest not present");
    }
    const room = Rooms.findOne(booking.roomId);

    if (!hotel || !room || room.hotelId !== hotel._id) {
      throw new Meteor.Error("Room not found");
    }
    HotelBookings.insert({
      ...booking
    });
    //code to store activity log
    if (guest) {
      activityInsertData = {
        eventId: guest.eventId,
        activityModule: "Guests",
        activitySubModule: "Hotel booking",
        event: "insert",
        activityMessage:
          "Hotel booking is made for " +
          guest.guestTitle +
          " " +
          guest.guestFirstName +
          " " +
          guest.guestLastName +
          "."
      };
      activityRecordInsert(activityInsertData);
    }
    // });
  }
});

export const updateRoomBooking = new ValidatedMethod({
  name: "Hotels.methods.updateRoomBooking",
  validate: HotelBookSchema.validator({ clean: true }),
  run(booking) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, "delete-hotel-booking")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }

    const vacantRoom = HotelBookings.findOne({
      roomId: booking.roomId,
      hotelId: booking.hotelId,
      eventId: booking.eventId,
      guestId: null,
      placeHolderRoomNumber: booking.placeHolderRoomNumber
    });

    if (vacantRoom) {
      return HotelBookings.update(vacantRoom._id, {
        $set: booking
      });
    } else {
      return HotelBookings.insert({
        ...booking
      });
    }
  }
});

export const unbookRoom = new ValidatedMethod({
  name: "Hotels.methods.unbookroom",
  validate: null,
  run({ bookingId, guestIds }) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, "delete-hotel-booking")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    if (bookingId) {
      return HotelBookings.update(bookingId, {
        $set: {
          guestId: null
        }
      });
    }

    if (guestIds && guestIds.length) {
      return guestIds.map(guestId => {
        return HotelBookings.update(
          { guestId },
          {
            $set: {
              guestId: null
            }
          }
        );
      });
    }
    return null;
  }
});

export const reserveRoom = new ValidatedMethod({
  name: "Hotels.methods.reserveRooms",
  validate: null,
  run({ roomsToReserve, ...data }) {
    let hotel = Hotels.findOne(data.hotelId);
    if (!hotel) {
      throw new Meteor.Error("Hotel not found");
    }

    const bookedRooms = HotelBookings.find({ hotelId: data.hotelId }).fetch();
    const bookings = bookedRooms
      .filter(r => !isNaN(r.placeHolderRoomNumber))
      .sort((a, b) => a.placeHolderRoomNumber - b.placeHolderRoomNumber)
      .pop();

    let count = bookings ? bookings.placeHolderRoomNumber : 0;

    for (let i = 0; i < roomsToReserve; i++) {
      count++;
      HotelBookings.insert({
        ...data,
        placeHolderRoomNumber: count.toString()
      });
    }
  }
});

export const unreserveRoom = new ValidatedMethod({
  name: "Hotels.methods.unreserve",
  validate: null,
  run({ bookingId }) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, "unreserve-hotel-room")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    HotelBookings.remove(bookingId);
  }
});


export const getRooms = new ValidatedMethod({
  name: "Rooms.methods.getRooms",
  validate: null,
  run(eventId) {
    let rooms = Rooms.find({ eventId }).fetch();
    return rooms;
  }
});

export const getTotalAvailableRooms = new ValidatedMethod({
  name: "Hotels.methods.getTotalAvailable",
  validate: null,
  run(hotelId) {
    return totalAvailableRooms(hotelId);
  }
});

function totalAvailableRooms(hotelId) {
  var hotel = Hotels.findOne(hotelId);
  if (hotel) {
    var bookings = HotelBookings.find({ hotelId });
    var roomsReserved = getTotalRoomsReserved(hotel);
    return roomsReserved - bookings.count();
  } else {
    return 0;
  }
}

function availableRooms({ eventId, hotelId, hotelRoomId }) {
  var hotel = Hotels.findOne({
    _id: hotelId
  });

  if (hotel) {
    var bookings = HotelBookings.find({
      eventId,
      hotelId,
      hotelRoomId
    });
    var room = _.find(hotel.hotelRoomDetails, r => {
      return r._id === hotelRoomId;
    });
    var reservedRooms = room.hotelReservedRooms;
    var bookedRooms = 0;
    bookings.forEach(b => {
      bookedRooms += b.hotelRooms;
    });
    return reservedRooms - bookedRooms;
  } else {
    return 0;
  }
}

function getTotalRoomsReserved(hotel) {
  var roomsReserved = 0;
  _.each(hotel.hotelRoomDetails, room => {
    roomsReserved += room.hotelReservedRooms;
  });
  return roomsReserved;
}

function getRoomsReserved(hotel, roomCategory, roomType) {
  var roomsReserved = 0;
  _.each(hotel.hotelRoomDetails, room => {
    if (
      room.hotelRoomCategory === roomCategory &&
      room.hotelRoomType === roomType
    ) {
      roomsReserved += room.hotelReservedRooms ? room.hotelReservedRooms : 0;
    }
  });
  return roomsReserved;
}
