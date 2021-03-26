import { Template } from 'meteor/templating';
import './events_guest_profile_transport.html';
import { TransportVehicles } from '../../../../api/transport/transport_vehicles.js';
import { TransportDrivers } from '../../../../api/transport/transport_drivers.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { bookTransport, editTransport, removeTransport } from '../../../../api/transport/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { TransportBookings } from '../../../../api/transport/transportbookings.js';
import { ReactiveVar } from 'meteor/reactive-var';
import { Events } from '../../../../api/events/events.js';

let editId = new ReactiveVar(null);

Template.guest_profile_transport.onRendered(function() {
  editId.set(null);
  this.$('.modal').modal();
  this.$('.datepicker').pickadate({
    selectMonths: true,
    selectYears: 15,
    today: 'Today',
    clear: 'Clear',
    close: 'Ok',
    closeOnSelect: false
  });
  this.$('.timepicker').pickatime({
    default: 'now',
    fromnow: 0,
    twelvehour: true,
    donetext: 'OK',
    cleartext: 'Clear',
    canceltext: 'Cancel',
    autoclose: false,
    ampmclickable: true,
    aftershow: function(){}
  });
  this.autorun(() => {
    let event = Events.findOne();
    let vehicles = TransportVehicles.find();
    let drivers = TransportDrivers.find();
    this.$('select').material_select();

    if(!event) return;
    let startPicker = this.$('#transportStartDate').pickadate('picker');
    startPicker.set('select', event.basicDetails.eventStart);
    let endPicker = this.$('#transportEndDate').pickadate('picker');
    endPicker.set('select', event.basicDetails.eventStart);
  });

  this.autorun(() => {
    let editing = editId.get();
    let selects = (booking) => {
      this.$('#vehicleId').val(booking.vehicleId);
      this.$("#driverId").val(booking.driverId);
      this.$("#transportType").val(booking.transportType);
      Meteor.setTimeout(() => {
	this.$('select').material_select();
      }, 100);
    };
    if(editing) {
      let booking = TransportBookings.findOne(editing);
      selects(booking);
    }
    else {
      selects({});
    }
  });
});

Template.guest_profile_transport.helpers({
  vehicleList() {
    return TransportVehicles.find();
  },

  driverList() {
    return TransportDrivers.find();
  },

  bookingInfo() {
    let editing = editId.get();
    if(editing) {
      let t = TransportBookings.findOne(editing);
      return t ? t : {};
    }
    return {};
  },

  bookingList() {
    console.log(TransportBookings.find().fetch());
    return TransportBookings.find().map(b => {
      let driver = TransportDrivers.findOne(b.driverId);
      let vehicle = TransportVehicles.findOne(b.vehicleId);
      return {
	driverName: driver ? driver.driverName : "Unknown",
	vehicleType: vehicle ? vehicle.vehicleType : "Unknown",
	type: b.transportType === 'dedicated' ? "Dedicated" : "Pool",
	from: b.transportStartDate + ', ' + b.transportStartTime,
	to: b.transportEndDate + ', ' + b.transportEndTime,
	...b
      }
    });
  },

  title() {
    return editId.get() ? "Edit booking" : "Add booking";
  }
});

Template.guest_profile_transport.events({
  'submit #guest-profile-transport'(event, template) {
    event.preventDefault();
    let jq = template.$(event.target);
    let data = jq.serializeObject();
    data.guestId = FlowRouter.getParam("guestId");
    data.eventId = FlowRouter.getParam("id");
    let editing = editId.get();
    let cbText = editing ? "Edited booking" : "Booked transport";
    let cb = (err, res) => {
      if(err) showError(err)
      else  showSuccess(cbText);
      if(!err) {
	template.$('.modal').modal('close');
	jq[0].reset();
	editId.set(null);
      }
    };
    if(editing) {
      data.bookingId = editing;
      editTransport.call(data, cb)
    }
    else {
      bookTransport.call(data, cb);
    }
  },

  'click #add-transport-modal'(event, template) {
    editId.set(null);
  }
});

Template.guest_profile_transport_card.events({
  'click #edit-transport'(event, template) {
    console.log(template.data.booking);
    editId.set(template.data.booking._id);
  },

  'click #delete-transport'(event, template) {
    mbox.confirm("Are you sure", (yes) => {
      if(!yes) return;
      removeTransport.call(template.data.booking._id, (err, res) => {
	if(err) showError(err);
	else showSuccess("Removed booking");
      });
    });
  }
});
