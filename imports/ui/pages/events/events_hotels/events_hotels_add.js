// Time-stamp: 2017-08-27
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_hotels_add.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import {
  showError,
  showSuccess
} from "../../../components/notifs/notifications.js";
import { insertHotel, updateHotel } from "../../../../api/hotels/methods.js";
import { FlowRouter } from "meteor/kadira:flow-router";
import _ from "lodash";
import "../../../components/datetimepicker/datetimepicker.js";
import "./events_hotels_add_room.js";
import "./events_hotels_add.html";
import chance from "../../../../extras/randomizer.js";

let hotelRooms = new ReactiveVar([]);

Template.events_hotels_add.onRendered(function() {
  this.$(".tooltip-icon").tooltip({ delay: 50 });
  hotelRooms.set([]);
  Meteor.setTimeout(() => {
    Materialize.updateTextFields();
  }, 100);
  this.$("input#hotel_name").characterCounter();
});

Template.events_hotels_add.helpers({
  title() {
    return this.hotelInfo ? "Edit Hotel" : "Add Hotel";
  },

  buttonText() {
    return this.hotelInfo ? "Update Hotel" : "Submit";
  },

  info() {
    if (this.hotelInfo) return this.hotelInfo;
    if (Meteor.settings.public.autoFillForm)
      return {
        hotelName: chance.name(),
        hotelContactName: chance.name(),
        hotelContactDesignation: chance.word(),
        hotelContactPhone: chance.phone(),
        hotelType: chance.word(),
        hotelAddress1: chance.address(),
        hotelAddress2: chance.address(),
        hotelAddressCity: chance.city(),
        hotelAddressState: chance.state(),
        hotelAddressPincode: chance.zip(),
        hotelAddressLandmark: chance.word()
      };
    return {};
  }
});

Template.events_hotels_add.events({
  "submit #add-hotel-form"(event, template) {
    event.preventDefault();
    let data = template.$(event.target).serializeObject();
    data.eventId = FlowRouter.getParam("id");
    let editing = !!template.data.hotelInfo;
    let successText = editing ? "Hotel Updated" : "Hotel Added";
    let cb = (err, res) => {
      if (err) {
        showError(err);
      } else {
        template.$(".modal").modal("close");
        showSuccess(successText);
        if (!editing)
          FlowRouter.go("events.hotel", { id: FlowRouter.getParam("id") });
      }
    };
    if (editing) {
      data.hotelId = template.data.hotelInfo._id;
      updateHotel.call(data, cb);
    } else {
      insertHotel.call(data, cb);
    }
  }
});
