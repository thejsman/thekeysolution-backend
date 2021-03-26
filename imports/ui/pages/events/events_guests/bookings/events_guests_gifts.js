import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router'
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Gifts } from '../../../../../api/gifts/gifts.js';
import { GiftBookings } from '../../../../../api/gifts/giftBooking.js';
import { Events } from '../../../../../api/events/events.js';
import { bookGifts, deleteGiftBooking, updateGiftBooking } from '../../../../../api/gifts/methods.js';
import { showError, showSuccess } from '../../../../components/notifs/notifications.js';

import './events_guests_gifts.html';

let editing = new ReactiveVar(false);
let editId = new ReactiveVar();

Template.agency_guest_gift_add.onRendered(function() {
  editing.set(false);
  this.$('.modal').modal();
});

Template.agency_guest_gift_add.helpers({
  giftList() {
    return Gifts.find();
  },

  giftBookings() {
    return GiftBookings.find({
      guestId: FlowRouter.getParam("guestId")
    }).map(booking => {
      let gift = Gifts.findOne(booking.giftId);
      if(gift) {
	return {
	  ...booking,
	  giftName: gift.giftName
	};
      }
      return booking;
    });
  },

  availableGifts(gift) {
    let booked = gift.bookedCount ? gift.bookedCount : 0;
    return gift.giftQuantity - booked;
  },

  modalTitle() {
    return editing.get() ? "Edit Gift Booking" : "Assign Gift / Giveaway"
  },

  bookingValues() {
    if(editing.get()) {
      return GiftBookings.findOne(editId.get());
    }
    else if(Meteor.settings.public.autoFillForm) {
      return {}; // fill with auto fill maybe
    }
    return {};
  }
});

Template.agency_guest_gift_add.events({
  'click #add-gift-button'(event, template) {
    editing.set(false);
  },
  'submit #add-gift-form'(event, template) {
    event.preventDefault();
    let data = template.$(event.target).serializeObject();
    data.eventId = FlowRouter.getParam("id");
    data.guestId = FlowRouter.getParam("guestId");

    let ed = editing.get();
    let edId = editId.get();

    let cbText = ed ? "Updated Gift Booking" : "Gift Booked";
    
    let cb = (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	event.target.reset();
	template.$('.modal').modal('close');
	showSuccess(cbText);
      }
    };
    if(ed) {
      data.bookingId = editId.get();
      updateGiftBooking.call(data, cb);
    }
    else {
      bookGifts.call(data, cb);
    }    
  }
});

Template.agency_guest_gift_add.onRendered(function() {  
  this.$('.datepicker').pickadate({
    selectMonths: true, // Creates a dropdown to control month
    selectYears: 15, // Creates a dropdown of 15 years to control year,
    today: 'Today',
    clear: 'Clear',
    close: 'Ok',
    closeOnSelect: false,
    // Close upon selecting a date,,
  });
  this.$('.timepicker').pickatime({
    default: 'now', // Set default time: 'now', '1:30AM', '16:30'
    fromnow: 0,       // set default time to * milliseconds from now (using with default = 'now')
    twelvehour: true, // Use AM/PM or 24-hour format
    donetext: 'OK', // text for done-button
    cleartext: 'Clear', // text for clear-button
    canceltext: 'Cancel', // Text for cancel-button
    autoclose: false, // automatic close timepicker
    ampmclickable: true, // make AM PM clickable
    aftershow: function(){} //Function for after opening timepicker
  });
  this.autorun(() => {
    let giftBookings = GiftBookings.find().count();
    let ed = editing.get();
    if(ed) {
      let editingId = editId.get();
      let booking = GiftBookings.findOne(editingId);
      if(booking) {
	this.$('#giftId').val(booking.giftId);
      }      
    }
    Meteor.setTimeout(() => {
      this.$('select').material_select();
      Materialize.updateTextFields();
    }, 100);
  });

  this.autorun(() => {
    let event = Events.findOne();
    if(!event) return;
    let picker = this.$('.datepicker').pickadate('picker');    
    picker.set('select', event.basicDetails.eventStart);
  });
});


Template.guest_gift_info.events({
  'click .click_delete-gift-button'(event, template) {
    mbox.confirm('Delete gift? This cannot be undone', function(yes) {
      if (yes) {
	deleteGiftBooking.call(template.data.gift._id, (err, res) => {
	  if(err) {
	    showError(err);
	  }
	  else {
	    showSuccess("Gift booking deleted");
	  }
	});	
      }
    });
  },

  'click .click_edit-gift-button'(event, template) {
    editing.set(true);
    editId.set(template.data.gift._id);
  }
});
