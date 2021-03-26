import './events_guest_service_bookings.html';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Services, ServiceSlots } from '../../../../../api/services/services.js';
import { ServiceBookings } from '../../../../../api/services/serviceBooking.js';
import { ReactiveVar } from 'meteor/reactive-var';
import _ from 'lodash';
import { bookServices, unbookService, updateBooking } from '../../../../../api/services/methods.js';
import { showError, showSuccess } from '../../../../components/notifs/notifications.js';

let currentServiceId = new ReactiveVar(null);
let currentDate = new ReactiveVar(null);
let editId = new ReactiveVar(null);
Template.agency_guest_service_add.onRendered(function() {
  currentServiceId.set(null);
  currentDate.set(null);
  editId.set(null);
  this.$('.modal').modal();

  this.autorun(() => {
    let services = Services.find().count();
    let serviceSlots = ServiceSlots.find().count();
    let date = currentDate.get();
    Meteor.setTimeout(() => {
      this.$('select').material_select();
      this.$('.tooltip-icon').tooltip({delay: 50});
    }, 1000);
  });

  this.autorun(() => {
    let serviceId = currentServiceId.get();
    if(serviceId) {
      let sub = this.subscribe('service.slots', serviceId);
    }
  });

  this.autorun(() => {
    let editing = editId.get();
    if(editing) {
      let booking = ServiceBookings.findOne(editing);
      currentDate.set(booking.serviceDate);
      currentServiceId.set(booking.serviceId);
      console.log(this.$("#serviceId")[0]);
      this.$('#serviceId').val(booking.serviceId);
      this.$('#serviceDate').val(booking.serviceDate);
      this.$('#serviceTime').val(booking.serviceTime);

      Meteor.setTimeout(() => {
	this.$('select').material_select();
      }, 1000);
    }
    else {
      currentDate.set(null);
      currentServiceId.set(null);
      this.$('#serviceId').val(null);
      this.$('#serviceDate').val(null);
      this.$('#serviceTime').val(null);
    }
  });
});

Template.agency_guest_service_add.helpers({
  modalTitle() {
    return editId.get() ? "Edit Booking" : "Add Service Booking";
  }
});

Template.agency_guest_service_add.events({
  'click #add-services-button'(event, template) {
    editId.set(null);
  },
  'change #serviceId'(event, template) {
    currentServiceId.set(event.target.value);
    console.log(currentServiceId.get());
  },

  'change #serviceDate'(event, template) {
    console.log(event.target.value);
    currentDate.set(event.target.value);
  },

  'submit #add-service-form'(event, template) {
    event.preventDefault();
    let jq = template.$(event.target);
    let data = jq.serializeObject();
    data.guestId = FlowRouter.getParam("guestId");
    let editing = editId.get();
    let cbText = editing ? "Updated service booking" : "Service booked";
    let cb = (err, res) => {
      if(err) showError(err);
      else {
	showSuccess(cbText);
	template.$('.modal').modal('close');
	jq[0].reset();
	currentDate.set(null);
	currentServiceId.set(null);
	editId.set(null);
      }
    }
    if(editing) {
      data.bookingId = editing;
      updateBooking.call(data, cb)
    }
    else {
      bookServices.call(data, cb);
    }
  }
});

Template.guest_service_info.events({
  'click .click_edit-service-button'(event, template) {
    editId.set(template.data.service._id);
  },

  'click .click_delete-service-button'(event, template) {
    mbox.confirm("Are you sure?" , (yes) => {
      if(!yes) return;
      let bookingId = template.data.service._id;
      unbookService.call(bookingId, (err, res) => {
	if(err) showError(err);
	else showSuccess("Unbooked service");
      });
    });
  }
});

Template.agency_guest_service_add.helpers({
  serviceBookings() {
    console.log(ServiceBookings.find().fetch());
    return ServiceBookings.find({ guestId: FlowRouter.getParam("guestId")});

  },
  serviceList() {
    return Services.find({
      'providers.0': {
	$exists: true
      }
    });
  },

  dateList() {
    let slots = ServiceSlots.find().fetch();
    let dates = _.map(_.groupBy(slots, 'serviceDate'), (v, k) => {
      return k;
    });
    return dates;
  },

  timeList() {
    let cd = currentDate.get();
    if(cd) {
      let slots = ServiceSlots.find().fetch();
      let dateSlots = _.groupBy(slots, 'serviceDate')[cd];
      if(!dateSlots) {
	return [];
      }
      let timeSlots = _.map(_.groupBy(dateSlots, 'serviceTime'), (v,k) => {
	return k;
      });
      return timeSlots;
    }
    return [];
  },

  availableSlots(service) {
    let providers = service.providers;
    let total = 0;
    let booked = 0;
    if(providers) {
      providers.forEach(p => {
	total += p.totalSlots ? p.totalSlots : 0;
	booked += p.bookedSlots ? p.bookedSlots : 0;
      });
    }
    return total - booked;
  }
});
