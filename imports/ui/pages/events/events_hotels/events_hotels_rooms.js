import "./events_hotels_rooms.html";
import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { Rooms } from "../../../../api/hotels/rooms.js";
import { HotelBookings } from "../../../../api/hotels/hotelBookings.js";
import { Guests } from "../../../../api/guests/guests.js";
import { reserveRoom, unreserveRoom } from "../../../../api/hotels/methods.js";
import { FlowRouter } from "meteor/kadira:flow-router";
import {
  showError,
  showSuccess
} from "../../../components/notifs/notifications.js";
import _ from "lodash";

const guestList = new ReactiveVar([]);

Template.events_hotels_rooms.onRendered(function() {
  this.autorun(() => {
    this.$(".tooltip-icon").tooltip({ delay: 50 });
    this.$(".tooltipped").tooltip({ delay: 50 });
    let currentRoom = this.data.currentRoom.get();
    if (currentRoom) {
      this.$("#room-total-number").val("");
      Meteor.subscribe("hotelbookings.byRoomId", currentRoom.room._id);

      const bookedRooms = HotelBookings.find({
        roomId: currentRoom.room._id
      }).fetch();
      const guestIds = bookedRooms.filter(r => r.guestId).map(r => r.guestId);
      Meteor.subscribe("room.guests.names", guestIds);
    }
  });
});

Template.events_hotels_rooms.helpers({
  maxRooms() {
    return 10;
    // let currentRoom = this.currentRoom.get();
    // if (currentRoom) {
    //   let rooms = Rooms.find({
    //     hotelRroomId: currentRoom.room.hotelRoomId
    //   }).count();
    //   let available = currentRoom.room.hotelRoomTotal - rooms;
    //   return available;
    // }
    // return 0;
  },

  bookedRoomList() {
    let currentRoom = this.currentRoom.get();
    if (currentRoom) {
      const bookedRooms = HotelBookings.find({ roomId: currentRoom.room._id })
        .fetch()
        .sort((a, b) => a.placeHolderRoomNumber - b.placeHolderRoomNumber);
      const guestIds = bookedRooms.filter(r => r.guestId).map(r => r.guestId);
      const guests = Guests.find({
        _id: {
          $in: guestIds
        }
      }).fetch();
      guestList.set(guests);
      return bookedRooms.map(r => {
        return {
          ...r,
          guest: guests.find(g => g._id === r.guestId)
        };
      });
    }
    guestList.set([]);
    return [];
  },

  roomGuests() {
    const guests = guestList.get();
    return guests;
  },

  eventId() {
    return FlowRouter.getParam("id");
  },

  spaceLeft(room) {
    if (room.assignedTo && room.assignedTo.length > 0) {
      return room.capacity - room.assignedTo.length;
    } else {
      return room.capacity;
    }
  }
});

Template.events_hotels_rooms.events({
  "submit #reserve-rooms"(event, template) {
    event.preventDefault();
    let roomsToReserve = template.$("#room-total-number").val();
    let roomData = template.data.currentRoom.get();
    if (!isNaN(roomsToReserve) && roomsToReserve > 0 && roomData) {
      const currentRoom = roomData.room;
      const eventId = FlowRouter.getParam("id");

      const data = {
        roomsToReserve,
        eventId,
        hotelId: currentRoom.hotelId,
        roomId: currentRoom._id,
        guestId: null
      };

      reserveRoom.call(data, (err, res) => {
        if (err) {
          showError(err);
        } else {
          showSuccess("Reserved Rooms");
          template.$("#room-total-number").val("");
        }
      });
    }
  },

  "click .unreserve-button"(event, template) {
    mbox.confirm("Are you sure?", yes => {
      if (!yes) return;
      let bookingId = event.target.id;
      unreserveRoom.call({ bookingId }, (err, res) => {
        if (err) showError(err);
        else {
          showSuccess("Removed reserved room");
        }
      });
    });
  }
});
