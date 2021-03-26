import './events_hotelsforsale_rooms.html';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Rooms } from '../../../../api/hotelsforsale/roomsforsale.js';
import { Guests } from '../../../../api/guests/guests.js';
import { reserveRoom, unreserveRoom } from '../../../../api/hotelsforsale/methods.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import _ from 'lodash';

Template.events_hotelsforsale_rooms.onRendered(function() {
  this.autorun(() => {
    let currentRoom = this.data.currentRoom.get();
    if(currentRoom) {
      this.$('#room-total-number').val('');
      let rooms = Rooms.find({
	hotelRoomId: currentRoom.room.hotelRoomId
      }).map(r => r.assignedTo);
      let finalRooms = _.uniq(_.compact(_.flatten(rooms)));
      Meteor.subscribe('room.guests.names', finalRooms);
    }
  });
});

Template.events_hotelsforsale_rooms.helpers({
  maxRooms() {
    let currentRoom = this.currentRoom.get();
    if(currentRoom) {
      let rooms = Rooms.find({
	hotelRroomId: currentRoom.room.hotelRoomId
      }).count();
      let available =  currentRoom.room.hotelRoomTotal - rooms;
      return available;
    }
    return 0;
  },

  roomList() {
    let currentRoom = this.currentRoom.get();
    if(currentRoom) {
      return Rooms.find({hotelRoomId: currentRoom.room.hotelRoomId });
    }
    return [];
  },

  assigned(assignedList) {
    if(!assignedList) {
      return [];
    }
    console.log(Guests.find().fetch());
    return Guests.find({
      _id: {
	$in: assignedList
      }
    });
  },

  eventId() {
    return FlowRouter.getParam("id");
  },

  spaceLeft(room) {
    if(room.assignedTo && room.assignedTo.length > 0) {
      return room.capacity - room.assignedTo.length;
    }
    else {
      return room.capacity;
    }
  }
});

Template.events_hotelsforsale_rooms.events({
  'submit #reserve-rooms'(event, template) {
    event.preventDefault();
    let rooms = template.$('#room-total-number').val();
    let room = template.data.currentRoom.get();
    if(rooms > 0 && room) {
      let currentRoom = room.room;
      let data = {
	hotelId : currentRoom.hotelId,
	hotelRoomId: currentRoom.hotelRoomId,
	hotelRooms: rooms
      };
      reserveRoom.call(data, (err,res) => {
	if(err) {
	  showError(err);
	}
	else {
	  showSuccess("Reserved Rooms");
	  // template.$('.modal').modal('close');
	}
      });
    }
  },

  'click .unreserve-button'(event, template) {
    mbox.confirm("Are you sure?", (yes) => {
      if(!yes) return;
      let roomId = event.target.id;
      unreserveRoom.call({roomId }, (err, res) => {
	if(err) showError(err);
	else {
	  showSuccess("Removed reserved room");
	}
      });
    });
  }
});
