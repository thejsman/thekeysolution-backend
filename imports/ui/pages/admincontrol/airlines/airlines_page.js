// Time-stamp: 2017-08-17
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : airlines_page.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { Airlines } from '../../../../api/airlines/airlines.js';
import { insertAirline, updateAirline, deleteAirline } from '../../../../api/airlines/methods.js';

import './airlines_page.scss';
import './airlines_page.html';

let deleteModal = null;
let deleteId = new ReactiveVar();
let editModal = null;
let editId = new ReactiveVar();

Template.airlines_page.onRendered(function() {
  // this.subscribe('airlines.all');
});

Template.airlines_page.helpers({
  hasAirlines() {
    console.log(Airlines.find().fetch());
    return Airlines.find().count() > 0;
  },

  airlineList() {
    return Airlines.find();
  }
});

Template.add_airline_button.onRendered(function() {
  this.$('.modal').modal();
});

Template.add_airline_button.events({
  'submit #add-airline'(event, template) {
    event.preventDefault();
    var target = template.$(event.target);
    var data = target.serializeObject();
    template.$(event.target)[0].reset();
    template.$('.modal').modal('close');
    insertAirline.call(data, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("Airline Added");
      }
    });
  }
});

Template.airline_details_item.events({
  'click .click_delete-airline-button'(event, template) {
    console.log(template.data.info);
    deleteId.set(template.data.info._id);
    deleteModal.modal('open');
  },

  'click .click_edit-airline-button'(event, template) {
    console.log(template.data.info);
    editId.set(template.data.info._id);
    editModal.modal('open');
  }
});

Template.airline_edit_modal.onRendered(function() {
  editModal = this.$('.modal');
  editModal.modal();

  this.autorun(() => {
    let edId = editId.get();
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
    }, 100);
  });
});

Template.airline_edit_modal.helpers({
  airlineDetails() {
    if(editId.get()) {
      return Airlines.findOne(editId.get());
    }
    else {
      return false;
    }
  }
});

Template.airline_edit_modal.events({
  'submit #edit-airline'(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    data.airlineId = editId.get();
    editModal.modal('close');
    updateAirline.call(data, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("EDITED AIRLINE DETAILS");
      }
    });
  }
});


Template.airline_delete_confirm.onRendered(function() {
  deleteModal = this.$('.modal');
  deleteModal.modal();
  console.log(deleteModal);
});


Template.airline_delete_confirm.events({
  'click .click_delete-airline'(event, template) {
    deleteModal.modal('close');
    var airportId = deleteId.get();
      deleteAirline.call(airportId, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("Airline deleted");
      }
    });
  }
});
