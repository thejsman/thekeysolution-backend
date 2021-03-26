// Time-stamp: 2017-06-22
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : methods.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Events } from '../events/events.js';
import { Hotelsforsale as Hotels } from './hotelsforsale.js';
import { Roles } from 'meteor/meteor-roles';

import { Rooms, RoomCount } from './roomsforsale.js';
import { HotelforsaleBookings as HotelBookings } from './hotelforsaleBookings.js';
import { HotelforsaleSchema , HotelforsaleRoomSchema, HotelforsaleReserveSchema, HotelforsaleBookSchema, HotelforsaleRoomUpdateSchema, HotelforsaleRoomRemarksUpdateSchema  } from './schema.js';
import { Guests } from '../guests/guests.js';
import { insertActivity } from '../../api/activity_record/methods.js';
import _ from 'lodash';
let isAllowed = (userId, role) => {
  let scopes = Roles.getScopesForUser(userId);
  console.log(scopes);
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
function activityRecordInsert(data){
     var activityEvent='';
     var activityEventId='';
     var activityUserInfo={
        id:Meteor.userId(),
        name:Meteor.user().profile.name,
        email:Meteor.user().emails[0].address,
      }
      if(data.eventId==null || data.eventId=='' || data.eventId==undefined){
         activityEvent='general';
         activityEventId='general';
      }
      else{
         var event=Events.findOne(data.eventId);
         activityEvent=event.basicDetails.eventName;
         activityEventId=event._id;
      }
      var date = new Date();
      userdata={
        activityeDateTime:date, //date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+'.'+date.getMilliseconds(),
        activityUserInfo:activityUserInfo,
        activityModule:data.activityModule,
        activitySubModule:data.activitySubModule,
        activityEvent:activityEvent,
        activityEventId:activityEventId,
        activityMessage:data.activityMessage,

      }
      insertActivity.call(userdata, (err, res) => {
      if(err) {
        console.log('Insert Activity record Error :: ',  err);
        return 0;
      }
      else {
        return true;
      }
    });
};


export const insertHotelforsale = new ValidatedMethod({
  name: "Hotelsforsale.methods.insert",
  validate: HotelforsaleSchema.validator({ clean: true }),
  run(newHotel) {
    var event = Events.findOne({
      _id: newHotel.eventId
    });

    if(event) {
      Hotels.insert(newHotel);
    }
    else {
      throw new Meteor.Error("Event Id Invalid");
    }
  }
});

export const updateHotelforsale = new ValidatedMethod({
  name: "Hotelsforsale.methods.update",
  validate: HotelforsaleSchema.validator({ clean: true }),
  run(hotelInfo) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'edit-hotels')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }
    Hotels.update(hotelInfo.hotelId, {
      $set: hotelInfo
    });
  }
});

export const addHotelforsaleRooms = new ValidatedMethod({
  name: "Hotelsforsale.methods.addRoom",
  validate: HotelforsaleRoomSchema.validator({ clean:true }),
  run(newRoom) {
    let event = Events.findOne(newRoom.eventId);
    let hotel = Hotels.findOne(newRoom.hotelId);

    if (event && hotel) {
      newRoom.hotelRoomId = Random.id();
      Hotels.update({
	_id: hotel._id
      }, {
	$push: {
	  hotelRooms: newRoom
	}
      })
    }
    else {
      throw new Meteor.Error("Event or hotel not found");
    }
  }
});

export const removeHotelforsaleRooms = new ValidatedMethod({
  name: "Hotelsforsale.methods.removeRoom",
  validate: null,
  run(info) {

    Hotels.update(info.hotelId, {
      $pull: {
	hotelRooms: { hotelRoomId: info.hotelRoomId }
      }
    });

    let rooms = Rooms.find({ hotelRoomId: info.hotelRoomId }).map(r => r._id);

    Rooms.remove({ hotelId: info.hotelId, hotelRoomId: info.hotelRoomId });

    HotelBookings.remove({
      roomId: {
	$in: rooms
      },
      hotelId: info.hotelId
    });
  }
});

export const updateHotelforsaleRoom = new ValidatedMethod({
  name: "Hotelsforsale.methods.udpateRoom",
  validate: HotelforsaleRoomSchema.validator({ clean: true }),
  run(hotelRoom) {
    let event = Events.findOne(hotelRoom.eventId);
    let hotel = Hotels.findOne(hotelRoom.hotelId);
    if(event && hotel) {
      Hotels.update({
	'hotelRooms.hotelRoomId': hotelRoom.hotelRoomId
      }, {
	$set: {
	  'hotelRooms.$': hotelRoom
	}
      });

      //code to insert data in Activity Record

       activityInsertData={
          eventId:event.eventId,
          activityModule:'Guests',
          activitySubModule:'Hotel',
          event:'update',
          activityMessage:'Hotel is updated for event.'
      }
      activityRecordInsert(activityInsertData);

    }
  }
});

export const reserveRoom = new ValidatedMethod({
  name: "Hotelsforsale.methods.reserveRooms",
  validate: HotelforsaleReserveSchema.validator({clean: true}),
  run(reserveRoom) {
    let hotel = Hotels.findOne(reserveRoom.hotelId);
    if(!hotel) {
      throw new Meteor.Error("Hotel not found");
    }
    let room = _.find(hotel.hotelRooms, (r) => {
      return r.hotelRoomId === reserveRoom.hotelRoomId
    });
    let rooms = Rooms.find({ hotelRoomId: reserveRoom.hotelRoomId });
    if(rooms.count() >= room.hotelRoomTotal) {
      throw new Meteor.Error("Already fully reserved");
    }

    for(var i = 0; i < reserveRoom.hotelRooms; i++) {

      let roomCount = RoomCount.findOne({
	hotelId: reserveRoom.hotelId
      });
      if(!roomCount) {
	RoomCount.insert({
	  hotelId: reserveRoom.hotelId,
	  count: 1
	});
      }
      let count = roomCount ? roomCount.count : 1;
      count = ""+count;
      count = count.padStart(4,'0');
      Rooms.insert({
	eventId: hotel.eventId,
	hotelId: reserveRoom.hotelId,
	hotelRoomId: reserveRoom.hotelRoomId,
  hotelRoomCost:room.hotelRoomCost,
	capacity: room.hotelRoomMaxOccupants,
	roomNumber: count,
	assignedTo: []
      });
      RoomCount.upsert({ hotelId: reserveRoom.hotelId}, {
	$inc: {
	  count: 1
	}
      });
    }
  }
});

export const unreserveRoom = new ValidatedMethod({
  name: "Hotelsforsale.methods.unreserve",
  validate: null,
  run({ hotelId, roomId }) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'unreserve-hotel-room')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }
    Rooms.remove(roomId);
    HotelBookings.remove({
      roomId: roomId
    });
  }
});

export const removeHotelforsale = new ValidatedMethod({
  name: "Hotelsforsale.methods.remove",
  validate: null,
  run(hotelId) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'delete-hotels')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }
    Hotels.remove(hotelId);
    HotelBookings.remove({ hotelId });
    Rooms.remove({ hotelId });
  }
});

export const reserveHotelforsale = new ValidatedMethod({
  name: "Hotelsforsale.methods.reserve",
  validate: HotelforsaleReserveSchema.validator({ clean: true }),
  run(reservation) {
    var hotel = Hotels.findOne({
      _id: reservation.hotelId
    });
    if(!hotel) {
      throw new Meteor.Error("Hotel not found");
    }

    Hotels.update({
      _id: reservation.hotelId,
      "hotelRoomDetails._id": reservation.hotelRoomId
    }, {
      "$inc": {
	'hotelRoomDetails.$.hotelReservedRooms': reservation.hotelRooms
      }
    });
  }
});

export const UpdateRoomNumber = new ValidatedMethod({
  name: "Hotelsforsale.methods.updateRoom",
  validate: HotelforsaleRoomUpdateSchema.validator({ clean: true }),
  run(booking) {
    let reservation = HotelBookings.findOne(booking.bookingId);
    if(!reservation) {
      throw new Meteor.Error("Cannot find booking to update");
    }
    console.log(reservation);
    HotelBookings.update({
      hotelId: reservation.hotelId,
      roomId: reservation.roomId
    }, {
      $set: {
	hotelRoomNumber: booking.roomNumber
      }
    }, {
      multi: true
    });

    Rooms.update(reservation.roomId, {
      $set: {
	hotelRoomNumber: booking.roomNumber
      }
    });


      //code to insert data in Activity Record
       let guests = Guests.findOne( reservation.guestId );

       activityInsertData={
          eventId:guests.eventId,
          activityModule:'Guests',
          activitySubModule:'Hotel Room',
          event:'update',
          activityMessage:'Room number of hotel is updated for '+guests.guestTitle+' '+guests.guestFirstName+' '+guests.guestLastName+'.'
      }
      activityRecordInsert(activityInsertData);


  }
});

export const UpdateRoomRemarks = new ValidatedMethod({
  name: "Hotelsforsale.methods.updateRoomRemarks",
  validate: HotelforsaleRoomRemarksUpdateSchema.validator({ clean: true }),
  run(booking) {
    let reservation = HotelBookings.findOne(booking.bookingId);
    if(!reservation) {
      throw new Meteor.Error("Cannot find booking to update");
    }
    let room = Rooms.find(reservation.roomId);

    HotelBookings.update({
      hotelId: reservation.hotelId,
      hotelRoomId: reservation.hotelRoomId
    }, {
      $set: {
	hotelRoomRemarks: booking.roomRemarks
      }
    }, {
      multi: true
    });

    Rooms.update(reservation.roomId, {
      $set: {
	hotelRoomRemarks: booking.roomRemarks
      }
    });
  }
});


export const bookRoom = new ValidatedMethod({
  name: "Hotelsforsale.methods.book",

  validate: HotelforsaleBookSchema.validator({ clean: true }),
  run(booking) { console.log(booking);
    let hotel = Hotels.findOne(booking.hotelId);
    let room = Rooms.findOne(booking.roomId);

    if(!room) {
      throw new Meteor.Error("Room not found");
    }

    let capacity = room.capacity;
    let bookings = room.assignedTo ? room.assignedTo : [];

    if(bookings.length >= capacity) {
      throw new Meteor.Error("Room already full");
    }

    let spaceLeft = capacity - bookings.length;
    if(booking.selectedPeople.length > spaceLeft) {
      throw new Meteor.Error("Room cannot accomodate so many people");
    }

    Rooms.update(booking.roomId, {
      $push: {
	assignedTo: {
	  $each: booking.selectedPeople
	}
      }
    });
    _.each(booking.selectedPeople, (person) => {
      HotelBookings.insert({
  hotelBookingReferenceNo:booking.hotelBookingReferenceNo,
	hotelId: booking.hotelId,
	roomId: booking.roomId,
	hotelRoomId: room.hotelRoomId,
  hotelRoomBookCost:room.hotelRoomCost,
	guestId: person,
	roomNumber: room.roomNumber,
	hotelRoomNumber: room.hotelRoomNumber,
	hotelRoomRemarks: room.hotelRoomRemarks
      });

   //code to insert data in Activity Record
       let guests = Guests.findOne( person );

       activityInsertData={
          eventId:guests.eventId,
          activityModule:'Guests',
          activitySubModule:'Hotel Room book',
          event:'add',
          activityMessage:'Hotel room is booked for '+guests.guestTitle+' '+guests.guestFirstName+' '+guests.guestLastName+'.'
      }
      activityRecordInsert(activityInsertData);

    });
  }
});

export const unbookRoom = new ValidatedMethod({
  name: "Hotelsforsale.methods.unbookroom",
  validate: null,
  run(bookingId) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'delete-hotel-booking')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }
    let booking = HotelBookings.findOne(bookingId);
    if(!booking) throw new Meteor.Error("Booking not found");
    Rooms.update(booking.roomId, {
      $pull: {
	assignedTo: booking.guestId
      }
    });
    HotelBookings.remove(bookingId);


   //code to insert data in Activity Record
       let guests = Guests.findOne( booking.guestId );

       activityInsertData={
          eventId:guests.eventId,
          activityModule:'Guests',
          activitySubModule:'Hotel Room book',
          event:'add',
          activityMessage:'Hotel room booking is canceled for '+guests.guestTitle+' '+guests.guestFirstName+' '+guests.guestLastName+'.'
      }
      activityRecordInsert(activityInsertData);


  }
});

export const getReservedRooms = new ValidatedMethod({
  name: "Hotelsforsale.methods.getReservedRooms",
  validate: null,
  run(hotelId) {
    let hotel = Hotels.findOne(hotelId);
    let rooms = hotel.hotelRooms ? hotel.hotelRooms : [];
    let allRooms = 0;
    rooms.forEach(r => { allRooms += r.hotelRoomTotal; });
    let bookedRooms = Rooms.find({
      hotelId,
      'assignedTo.0': {
	$exists: true
      }
    });
    let totalRooms = Rooms.find({ hotelId });
    return {
      allRooms,
      totalRooms: totalRooms.count(),
      bookedRooms: bookedRooms.count()
    }
  }
});

export const getAvailableRooms = new ValidatedMethod({
  name: "Hotelsforsale.methods.getAvailable",
  validate: null,
  run(hotelId) {
    let bookedRooms = Rooms.find({
      hotelId,
      'assignedTo.0': {
	$exists: true
      }
    });
    let totalRooms = Rooms.find({ hotelId });

    return totalRooms.count() - bookedRooms.count();
  }
});

export const getTotalAvailableRooms= new ValidatedMethod({
  name: "Hotelsforsale.methods.getTotalAvailable",
  validate: null,
  run(hotelId) {
    return totalAvailableRooms(hotelId);
  }
});

function totalAvailableRooms(hotelId) {
  var hotel = Hotels.findOne(hotelId);
  if(hotel) {
    var bookings = HotelBookings.find({ hotelId });
    var roomsReserved = getTotalRoomsReserved(hotel);
    return roomsReserved - bookings.count();
  }
  else {
    return 0;
  }
}

function availableRooms({ eventId, hotelId, hotelRoomId }) {
  var hotel = Hotels.findOne({
    _id: hotelId
  });

  if(hotel) {
    var bookings = HotelBookings.find({
      eventId,
      hotelId,
      hotelRoomId
    });
    var room = _.find(hotel.hotelRoomDetails, (r) => {
      return r._id === hotelRoomId;
    });
    var reservedRooms = room.hotelReservedRooms;
    var bookedRooms = 0;
    bookings.forEach(b => {
      bookedRooms += b.hotelRooms;
    });
    return reservedRooms - bookedRooms;
  }
  else {
    return 0;
  }
}

function getTotalRoomsReserved(hotel) {
  var roomsReserved = 0;
  _.each(hotel.hotelRoomDetails, (room) => {
    roomsReserved += room.hotelReservedRooms;
  });
  return roomsReserved;
}

function getRoomsReserved(hotel, roomCategory, roomType) {
  var roomsReserved = 0;
  _.each(hotel.hotelRoomDetails, (room) => {
    if(room.hotelRoomCategory === roomCategory &&
       room.hotelRoomType === roomType) {
      roomsReserved += room.hotelReservedRooms ? room.hotelReservedRooms : 0;
    }
  });
  return roomsReserved;
}
