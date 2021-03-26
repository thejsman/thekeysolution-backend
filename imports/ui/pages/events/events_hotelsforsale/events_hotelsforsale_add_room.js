// Time-stamp: 2017-08-27
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_hotels_add_room.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import { Template } from 'meteor/templating';
import { Random } from 'meteor/random';
import { HotelforsaleRoomSchema as HotelRoomSchema } from '../../../../api/hotelsforsale/schema.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import './events_hotelsforsale_add_room.html';
import { addHotelforsaleRooms as addHotelRooms, updateHotelforsaleRoom as updateHotelRoom, removeHotelforsaleRooms as removeHotelRooms } from '../../../../api/hotelsforsale/methods.js';
import { Hotelsforsale as Hotels } from '../../../../api/hotelsforsale/hotelsforsale.js';
import './events_hotelsforsale_rooms.js';
import { ReactiveVar } from 'meteor/reactive-var';
import {  Rooms } from '../../../../api/hotelsforsale/roomsforsale.js';
import { Meteor } from 'meteor/meteor';
import chance from '../../../../extras/randomizer.js';
import _ from 'lodash';

let selectedRoomType = new ReactiveVar(null);
let editing = new ReactiveVar(false);
let editId = new ReactiveVar('');

Template.events_hotelsforsale_add_room.onRendered(function() {
  editing.set(false);
  this.$('.datepicker').pickadate();
  this.$('.timepicker').pickatime();
  let event = this.data.eventInfo;
  let defaultDate = event ? event.basicDetails.eventStart : undefined;
  this.$('.modal').modal({
    dismissible: true,
    opacity: .5,
    inDuration: 300,
    outDuration: 200,
    startingTop: '4%',
    endingTop: '10%'
  });
  this.$('.datepicker').pickadate({
    closeOnSelect: true,
    selectYears: 20,
    onStart: function() {
      this.set('select', defaultDate);
    }
  });

  this.autorun(() => {
    let ed = editing.get();
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
    }, 100);
  });
});

Template.events_hotelsforsale_add_room.helpers({
  hotelRoomDetails() {
    let hotel = Hotels.findOne();
    return hotel ? hotel.hotelRooms : [];
  },

  selectedRoom() {
    return selectedRoomType;
  },

  title() {
    return editing.get() ? "Edit Room Details" : "Add Rooms";
  },

  roomDetails() {
    let ed = editing.get();
    if(ed) {
      let hotel = Hotels.findOne();
      let rooms = hotel.hotelRooms;
      console.log(rooms);
      let room = _.find(rooms, r => {
	return r.hotelRoomId === editId.get();
      });
      $('#check_in_time').val(room.hotelRoomFrom);
      $('#check_out_time').val(room.hotelRoomTo);

      return room ? room : {};
    }
    else if(Meteor.settings.public.autoFillForm){

      return {
	hotelRoomCategory: chance.word(),
	hotelRoomType: chance.word(),
	hotelRoomMaxOccupants: chance.natural({ max: 10 }),
	hotelRoomTotal: chance.natural({ max: 100 }),
	hotelRoomBedType: chance.word(),
	hotelRoomIsSmoking: chance.bool(),
	hotelRoomIsAdjoining: chance.bool(),
	hotelRoomIsConnecting: chance.bool(),
	hotelRoomFrom: chance.datetime({ string: true }),
	hotelRoomTo : chance.datetime({ string: true }),
	hotelRoomRemarks : chance.sentence()
      };
    }
    return {};
  }
});

Template.events_hotelsforsale_add_room.events({
  'click .add-rooms-button' (event, template) {
    editing.set(false);
  },
  'submit #add-new-hotel-for-sale-room'(event, template) {
    event.preventDefault();
    let jq = template.$(event.target);
    let data = jq.serializeObject();
    data.hotelRoomIsSmoking = !!data.hotelRoomIsSmoking;
    data.hotelId = template.data.hotelInfo._id;
    data.eventId = template.data.eventInfo._id;
    let cleanedData = HotelRoomSchema.clean(data);
    let context = HotelRoomSchema.newContext();
    context.validate(cleanedData, { clean : true });
    let cbText = editing.get() ? "Updated Room": "Added hotel rooms";
    let cb = (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess(cbText);
      }
      template.$('.modal').modal('close');
      jq[0].reset();
      editing.set(false);
    };
    if(context.isValid()) {
      if(editing.get()) {
	data.hotelRoomId = editId.get();
	updateHotelRoom.call(data, cb);
      }
      else {
	addHotelRooms.call(cleanedData, cb);
      }

    }
    else {
      console.log(context.validationErrors());
      showError(context.validationErrors()[0].toString());
    }
  }
});

Template.hotelforsale_rooms_room_details.helpers({
  reservedRooms(id) {

    return Rooms.find({ hotelRoomId: id }).count();
  }
});

Template.hotelforsale_rooms_room_details.events({
  'click .reserve-button'(event, template) {
    selectedRoomType.set({
      room: template.data.room
    });
  },

  'click .edit-room-button'(event, template) {
    editing.set(true);
    editId.set(template.data.room.hotelRoomId);
  },

  'click .delete-room-button'(event, template) {
    mbox.confirm('Delete this room', function(yes) {
      if(!yes) return;
      let room = template.data.room;
      removeHotelRooms.call(room, (err, res) => {
	if(err) {

	}
	else {
	  showSuccess("Removed Room");
	}
      });
    });
  }
})
