// Time-stamp: 2017-10-09
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_guests_hotel_bookings.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Hotelsforsale as Hotels } from '../../../../../api/hotelsforsale/hotelsforsale.js';
import { HotelforsaleBookings as HotelBookings} from '../../../../../api/hotelsforsale/hotelforsaleBookings.js';
import { ReactiveVar } from 'meteor/reactive-var';
import { bookRoom, unbookRoom } from '../../../../../api/hotelsforsale/methods.js';
import { showError, showSuccess } from '../../../../components/notifs/notifications.js';
import './events_guests_hotelforsale_bookings.html';
import './events_guests_bookings.scss';
import '../../events_hotelsforsale/events_hotelforsale_update_room.js';
import '../../events_hotelsforsale/events_hotelforsale_udpate_room_remarks.js';
import _ from 'lodash';
import {  Rooms } from '../../../../../api/hotelsforsale/roomsforsale.js';
import { Guests } from '../../../../../api/guests/guests.js';
import { Events } from '../../../../../api/events/events.js';

var currentHotel = new ReactiveVar();
var currentRoomCategory = new ReactiveVar();
var currentAvailableRooms = new ReactiveVar(0);
var editModal = null;
var editId = new ReactiveVar();
var editeventId = new ReactiveVar();

Template.agency_guest_hotelforsale_add.onRendered(function() {
  let eventId = FlowRouter.getParam("id");
  let initialized = false;
  this.autorun(() => {
    let guests = Guests.find();
    let hotelId = currentHotel.get();
    let hotelRoomId = currentRoomCategory.get();
    Meteor.setTimeout(() => {
      this.$('select').material_select();
    },1000);
    this.subscribe('hotelsforsale.room', hotelRoomId);
    this.subscribe('hotelsforsale.all', eventId);
    this.subscribe('hotelforsalebookings.guest', FlowRouter.getParam("guestId"));
    this.subscribe('events.one', eventId);

  });
  this.autorun(()=>{
    let rooms = Rooms.find();
    Meteor.setTimeout(() => {
      this.$('select').material_select();
    },100);
  });

  this.$('.modal').modal();
});

Template.agency_guest_hotelforsale_add.helpers({
  hotelList() {
    var hotels = Hotels.find();

    return hotels;
  },

  roomCategories() {
    let hotelId = currentHotel.get();
    if(hotelId) {
      let hotel = Hotels.findOne(hotelId);
      return hotel.hotelRooms;
    }
    return [];
  },

  rooms() {
    return Rooms.find({
      hotelRoomId: currentRoomCategory.get()
    });
  },

  spaceLeft(room) {
    if(room.assignedTo && room.assignedTo.length > 0) {
      return room.capacity - room.assignedTo.length;
    }
    else {
      return room.capacity;
    }
  },

  familyMembers() {
    return Guests.find();
  },

  canBookRoom() {
    let bookings = HotelBookings.find().map(b => b.guestId);
    return Guests.find({
      _id: {
	$nin: bookings
      }
    }).count() > 0;
  }
});


Template.agency_guest_hotelforsale_add.events({
  'change #hotelName'(event, template){
    currentHotel.set(event.target.value);
  },

  'change #hotelRoomCategory'(event, template){
    currentRoomCategory.set(event.target.value);
  },

  'submit #hotelforsale_book_room'(event, template) {
    event.preventDefault();
    var jq = template.$(event.target);
    var data = jq.serializeObject();
    data.eventId = FlowRouter.getParam("id");
    var date=new Date();
    data.referenceNumber=date.getTime();
    if(data.eventId){
      var event=Events.findOne(data.eventId);

      var name= event ? event.basicDetails.eventName.replace(/ /g,'').substring(0,3).toUpperCase() : '';
       data.hotelBookingReferenceNo='HFS'+name+data.referenceNumber;


    }
    
    bookRoom.call(data, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("Room booked");
	jq[0].reset();
	template.$('.modal').modal('close');
      }
    });
  }
});

Template.events_guests_hotelforsale_info.helpers({
  hotelforsaleBookingInfo() {

    let bookings = HotelBookings.find();
    if(bookings.count() > 0) {
      return bookings;
    }
    else {
      return false;
    }
  },

  hotelforsaleInfo() {
    var hotel = Hotels.findOne(this.hotelId);
    var room = _.find(hotel.hotelRooms, (r) => {
      return r.hotelRoomId === this.hotelRoomId;
    });
    let guest = Guests.findOne(this.guestId);
    return {
      _id: this._id,
      hotelName: hotel.hotelName,
      hotelRoomInfo: room,
      roomNumber: this.roomNumber,
      guestName: guest.guestFirstName,
      hotelRoomNumber: this.hotelRoomNumber,
      hotelRoomRemarks: this.hotelRoomRemarks,
      hotelBookingReferenceNo:this.hotelBookingReferenceNo,
      hotelRoomBookCost:this.hotelRoomBookCost,
    };
  }
});

Template.hotelforsale_booking_info_card.events({
  'click .click_delete-hotelforsale-booking'(event, template) {
    mbox.confirm("Are you sure?", (yes) => {
      if(!yes) return;
      unbookRoom.call(template.data.hotel._id, (err, res) => {
	if(err) showError(err);
	else {
	  showSuccess("Unbooked room");
	}
      });
    });
  }
});


Template.hotelforsaleinfo_edit_modal.onRendered(function() {
  editModal = this.$('.modal');
  editModal.modal();
  this.$('select').material_select();
  this.$('.datepicker').pickadate({
    closeOnSelect: true,
    selectYears: 1000,
  });


});
