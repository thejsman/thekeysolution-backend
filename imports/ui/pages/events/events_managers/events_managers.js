import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { HospitalityManager } from '../../../../api/managers/hospitalitymanager.js';
import { AirportManager } from '../../../../api/managers/airportmanager.js';

import { deleteHosman, updateHospitalityManager ,deleteAirman, updateAirManager} from '../../../../api/managers/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';

import './events_managers_add_hospitality.js';
import './events_managers_add_airport.js';
import './events_managers.html';

var deleteModal = null;
var deleteId = new ReactiveVar();
var editModal = null;
var editId = new ReactiveVar();
var editeventId = new ReactiveVar();
var deleteModal2 = null;
var deleteId2 = new ReactiveVar();
var editModal2 = null;
var editId2 = new ReactiveVar();
var editeventId2 = new ReactiveVar();
var editdriverId2 = new ReactiveVar();

Template.events_managers.onRendered(function() {
  this.subscribe('drivers.event', FlowRouter.getParam("id"));
  this.subscribe('airman.event', FlowRouter.getParam("id"));
  this.subscribe('hosman.event', FlowRouter.getParam("id"));
  this.subscribe('vehicles.event', FlowRouter.getParam("id"));
  this.$('.tooltipped').tooltip({delay: 50});
  Meteor.setTimeout(()=>{
    Materialize.updateTextFields();
  }, 100);
});

Template.events_managers.helpers({
  hospitalitymanagerlist() {
    return HospitalityManager.find();
  },
  airportmanagerlist() {
    return AirportManager.find();
  }
});

Template.hospitality_edit_modal.onRendered(function() {
  editModal = this.$('.modal');
  editModal.modal();
  this.autorun(() => {
    let edId = editId.get();
    Meteor.setTimeout(() => {
      this.$('.tooltipped').tooltip({delay: 50});
    }, 100);
  });
});

Template.hospitality_edit_modal.helpers({
  driverDetails() {
    if(editId.get()) {
      return HospitalityManager.findOne(editId.get());
    }
    else {
      return false;
    }
  }
});

Template.events_managers_hospitality_list.events({
  'click .click_delete-driver-button'(event, template) {
    deleteId.set(template.data.infodriver._id);
    deleteModal.modal('open');
  },

  'click .click_edit-driver-button'(event, template) {
	console.log(template.data.infodriver);
    editId.set(template.data.infodriver._id);
    editeventId.set(template.data.infodriver.eventId);
    editModal.modal('open');
  }
});


Template.hospitality_edit_modal.events({
  'submit #edit-driver'(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    data.managerId = editId.get();
    data.eventId = editeventId.get();
    console.log(data);
    updateHospitalityManager.call(data, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("EDITED HOSPITALITY MANAGER DETAILS");
	editModal.modal('close');
      }
    });
  }
});


Template.hospitality_delete_modal.onRendered(function() {
  deleteModal = this.$('.modal');
  deleteModal.modal();
});

Template.hospitality_delete_modal.events({
  'click .click_delete-driver'(event, template) {
    deleteModal.modal('close');
    var driverId = deleteId.get();
    deleteHosman.call(driverId, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("Hospitality Manager deleted");
      }
    });
  }
});

Template.aiport_manager_edit_modal.onRendered(function() {
  editModal2 = this.$('.modal');
  editModal2.modal();
  this.autorun(() => {
    let edId = editId2.get();
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
      this.$('.tooltipped').tooltip({delay: 50});
    }, 100);
  });
});

Template.aiport_manager_edit_modal.helpers({
  vehicleDetails() {
    if(editId2.get()) {
      return AirportManager.findOne(editId2.get());
    }
    else {
      return false;
    }
  }
});

Template.events_managers_airport_list.events({
  'click .click_delete-vehicle-button'(event, template) {
    deleteId.set(template.data.info._id);
    deleteModal2.modal('open');
  },

  'click .click_edit-vehicle-button'(event, template) {
	console.log(template.data.info.driverId);
    editId2.set(template.data.info._id);
    editeventId2.set(template.data.info.eventId);
    editdriverId2.set(template.data.info.driverId);
    editModal2.modal('open');
  }
});


Template.aiport_manager_edit_modal.events({
  'submit #edit-vehicle'(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    data.managerId = editId2.get();
    data.eventId = editeventId2.get();
    data.driverId = editdriverId2.get();
    updateAirManager.call(data, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("EDITED vehicle DETAILS");
	editModal2.modal('close');
      }
    });
  }
});


Template.aiport_manager_delete_confirm.onRendered(function() {
  deleteModal2 = this.$('.modal');
  deleteModal2.modal();
});

Template.aiport_manager_delete_confirm.events({
  'click .click_delete-vehicle'(event, template) {
    deleteModal2.modal('close');
    var vehicleId = deleteId.get();
    deleteAirman.call(vehicleId, (err, res) => {
      if(err) {
	      showError(err);
      }
      else {
	      showSuccess("Airport Manager deleted");
      }
    });
  }
});
