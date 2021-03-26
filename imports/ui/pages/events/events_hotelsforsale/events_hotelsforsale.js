// Time-stamp: 2017-08-27
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_hotels.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Hotelsforsale as Hotels } from '../../../../api/hotelsforsale/hotelsforsale.js';
import { getReservedRooms } from '../../../../api/hotelsforsale/methods.js';
import _ from 'lodash';
import './events_hotelsforsale.scss';
import './events_hotelsforsale.html';

Template.events_hotelsforsale.onRendered(function() {
  this.subscribe('hotelsforsale.all', FlowRouter.getParam("id"));
});

Template.events_hotelsforsale.helpers({
  hotelforsaleAddPath() {
    return FlowRouter.path('events.hotelforsale.add', { id : FlowRouter.getParam("id") });
  },

  hotelList() {
    return Hotels.find({
      hide: {
	      $ne : true
      }
    });
  }
});

Template.hotelforsale_card.onCreated(function() {
  this.availableRooms = new ReactiveVar(0);
  this.reservedRooms = new ReactiveVar(0);
  this.allRooms = new ReactiveVar(0);
});

Template.hotelforsale_card.onRendered(function() {
  getReservedRooms.call(this.data.hotel._id, (err, res) => {
    if(err) return;
    this.reservedRooms.set(res.totalRooms);
    this.availableRooms.set(res.totalRooms - res.bookedRooms);
    this.allRooms.set(res.allRooms);
  });
});

Template.hotelforsale_card.helpers({
  reservedRooms() {
    return Template.instance().reservedRooms.get();
  },

  roomsAvailable() {
    return Template.instance().availableRooms.get();
  },

  totalRooms() {
    return Template.instance().allRooms.get();
  }
});

Template.hotelforsale_card.events({
  'click'(event, template) {

    FlowRouter.go('events.hotelforsale.info', { id: FlowRouter.getParam("id"),
		hotelId: template.data.hotel._id});
      }
});
