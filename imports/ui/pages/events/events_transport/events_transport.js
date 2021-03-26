// Time-stamp: 2017-08-29
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_transport.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";
import { TransportDrivers } from "../../../../api/transport/transport_drivers.js";
import { TransportVehicles } from "../../../../api/transport/transport_vehicles.js";

import {
  deleteDriver,
  updateDriver,
  deleteVehicle,
  updateVehicle,
} from "../../../../api/transport/methods.js";
import {
  showError,
  showSuccess,
} from "../../../components/notifs/notifications.js";

import "./events_transport_add_vehicle.js";
import "./events_transport_add_driver.js";
import "./events_transport.html";

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

Template.events_transport.onRendered(function () {
  this.subscribe("drivers.event", FlowRouter.getParam("id"));
  this.$(".tooltipped").tooltip({ delay: 50 });
});

Template.events_transport.helpers({
  driverList() {
    console.log(TransportDrivers.find().fetch());
    return TransportDrivers.find();
  },
  vehicleList() {
    return TransportVehicles.find();
  },
});

Template.events_transport.onRendered(function () {
  this.subscribe("vehicles.event", FlowRouter.getParam("id"));
});

Template.driver_edit_modal.onRendered(function () {
  editModal = this.$(".modal");
  editModal.modal();
});

Template.driver_edit_modal.helpers({
  driverDetails() {
    if (editId.get()) {
      return TransportDrivers.findOne(editId.get());
    } else {
      return false;
    }
  },
});

Template.events_transport_drivers_list.events({
  "click .click_delete-driver-button"(event, template) {
    deleteId.set(template.data.infodriver._id);
    deleteModal.modal("open");
  },

  "click .click_edit-driver-button"(event, template) {
    console.log(template.data.infodriver);
    editId.set(template.data.infodriver._id);
    editeventId.set(template.data.infodriver.eventId);
    editModal.modal("open");
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
    }, 500);
  },
});

Template.driver_edit_modal.events({
  "submit #edit-driver"(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    data.driverId = editId.get();
    data.eventId = editeventId.get();
    updateDriver.call(data, (err, res) => {
      if (err) {
        showError(err);
      } else {
        showSuccess("EDITED DRIVER DETAILS");
        editModal.modal("close");
      }
    });
  },
});

Template.driver_delete_confirm.onRendered(function () {
  deleteModal = this.$(".modal");
  deleteModal.modal();
});

Template.driver_delete_confirm.events({
  "click .click_delete-driver"(event, template) {
    deleteModal.modal("close");
    var driverId = deleteId.get();
    deleteDriver.call(driverId, (err, res) => {
      if (err) {
        showError(err);
      } else {
        showSuccess("Driver deleted");
      }
    });
  },
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

Template.vehicle_edit_modal.onRendered(function () {
  this.$(".tooltipped").tooltip({ delay: 50 });
  editModal2 = this.$(".modal");
  editModal2.modal();
});

Template.vehicle_edit_modal.helpers({
  vehicleDetails() {
    if (editId2.get()) {
      return TransportVehicles.findOne(editId2.get());
    } else {
      return false;
    }
  },
});

Template.events_transport_vehicles_list.events({
  "click .click_delete-vehicle-button"(event, template) {
    deleteId.set(template.data.info._id);
    deleteModal2.modal("open");
  },

  "click .click_edit-vehicle-button"(event, template) {
    console.log(template.data.info.driverId);
    editId2.set(template.data.info._id);
    editeventId2.set(template.data.info.eventId);
    editdriverId2.set(template.data.info.driverId);
    editModal2.modal("open");
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
    }, 500);
  },
});

Template.vehicle_edit_modal.events({
  "submit #edit-vehicle"(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    data.vehicleId = editId2.get();
    data.eventId = editeventId2.get();
    data.driverId = editdriverId2.get();
    updateVehicle.call(data, (err, res) => {
      if (err) {
        showError(err);
      } else {
        showSuccess("EDITED vehicle DETAILS");
        editModal2.modal("close");
      }
    });
  },
});

Template.vehicle_delete_confirm.onRendered(function () {
  deleteModal2 = this.$(".modal");
  deleteModal2.modal();
});

Template.vehicle_delete_confirm.events({
  "click .click_delete-vehicle"(event, template) {
    deleteModal2.modal("close");
    var vehicleId = deleteId.get();
    deleteVehicle.call(vehicleId, (err, res) => {
      if (err) {
        showError(err);
      } else {
        showSuccess("Vehicle deleted");
      }
    });
  },
});
