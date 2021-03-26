import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Airports } from '../../../../api/airports/airports.js';
import { insertAirport, deleteAirport, updateAirport } from '../../../../api/airports/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';

import './airports_page.scss';
import './airports_page.html';

var deleteModal = null;
var deleteId = new ReactiveVar();
var editModal = null;
var editId = new ReactiveVar();
Template.airports_page.onRendered(function(){
  // this.subscribe('airports.all');
});

Template.airports_page.helpers({
  hasAirports() {
    return Airports.find().count() > 0;
  },
  airportList() {
    return Airports.find();
  }
});

Template.add_airport_button.onRendered(function() {
  this.$('.modal').modal();
});

Template.add_airport_button.events({
  'submit #add-airport'(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    template.$(event.target)[0].reset();
    template.$('.modal').modal('close');
    insertAirport.call(data, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("Added airport");
      }
    });
  }
});

Template.airport_details_item.events({
  'click .click_delete-airport-button'(event, template) {
    deleteId.set(template.data.info._id);
    deleteModal.modal('open');
  },

  'click .click_edit-airport-button'(event, template) {
    editId.set(template.data.info._id);
    editModal.modal('open');
  }
});

Template.airport_edit_modal.onRendered(function() {
  editModal = this.$('.modal');
  editModal.modal();
  this.autorun(() => {
    let edId = editId.get();
    console.log(edId);
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
    }, 100);
  });
});

Template.airport_edit_modal.helpers({
  airportDetails() {
    if(editId.get()) {
      return Airports.findOne(editId.get());
    }
    else {
      return false;
    }
  }
});

Template.airport_edit_modal.events({
  'submit #edit-airport'(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    data.airportId = editId.get();
    updateAirport.call(data, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("EDITED AIRPORT DETAILS");
	editModal.modal('close');
      }
    });
  }
});


Template.airport_delete_confirm.onRendered(function() {
  deleteModal = this.$('.modal');
  deleteModal.modal();
});

Template.airport_delete_confirm.events({
  'click .click_delete-airport'(event, template) {
    deleteModal.modal('close');
    var airportId = deleteId.get();
    deleteAirport.call(airportId, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("Airport deleted");
      }
    });
  }
});
