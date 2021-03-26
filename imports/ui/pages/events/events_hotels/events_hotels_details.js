// Time-stamp: 2017-08-27 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_hotels_details.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Hotels } from '../../../../api/hotels/hotels.js';
import { HotelReserveSchema } from '../../../../api/hotels/schema.js';
import { reserveHotel } from '../../../../api/hotels/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import './events_hotels_details.html';
import './events_hotels_add.js';
import _ from 'lodash';
import { Events } from '../../../../api/events/events.js';
import { ReactiveVar } from 'meteor/reactive-var';

var currentRoomCategory = new ReactiveVar('');

Template.events_hotels_details.onRendered(function() {
  this.$('.tooltip-icon').tooltip({delay: 50});
  var hotelId = FlowRouter.getParam("hotelId");
  var sub = this.subscribe('hotels.one', hotelId);
  currentRoomCategory.set('');
  let v = this.$('.modal').modal();  
});

Template.events_hotels_details.helpers({
  hotelInfo() {
    return Hotels.findOne();
  },

  eventInfo() {
    return Events.findOne();
  }
});


Template.hotel_reserve_room.helpers({
  roomCategories() {
    var hotel = Hotels.findOne();
    if(hotel) {
      return hotel.hotelRoomDetails;
    }
    else {
      return [];
    }
  },

  isSmoking(smoking) {
    return smoking ? "Yes" : "No";
  },

  maxRooms() {
    var category = currentRoomCategory.get();
    var hotel = Hotels.findOne();
    if(hotel) {
      var roomDetails = hotel.hotelRoomDetails;
      var room = _.find(roomDetails, (r) => {
	return r._id === category;
      });
      if(room) {
	return room.hotelReservedRooms ? room.hotelRoomTotal - room.hotelReservedRooms: room.hotelRoomTotal;
      }
      else {
	return 0;
      }
    }
    else {
      return 0;
    }
  }
});

Template.hotel_reserve_room.events({
  'change #hotelRoomCategory'(event, template){
    currentRoomCategory.set(event.target.value);
  },
  
  'submit #hotel_reserve_room'(event,template) {
    event.preventDefault();
    var jq = template.$(event.target);
    var data = jq.serializeObject();
    data.hotelId = FlowRouter.getParam("hotelId");
    data.hotelRoomId = currentRoomCategory.get();
    var cleanedObject = HotelReserveSchema.clean(data);
    reserveHotel.call(cleanedObject, (err, res) => {
      if(err) {
	showError(err.toString());
      }
      else {
	showSuccess("Reserved the rooms");
	jq[0].reset();
      }
    });
  }
});

Template.hotel_reserve_room.onRendered(function() {
  this.$('select').material_select();
});
