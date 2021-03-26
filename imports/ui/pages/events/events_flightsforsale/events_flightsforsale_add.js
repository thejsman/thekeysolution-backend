// Time-stamp: 2018-02-12
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_flights_add_leg.js
// Original Author    : saurabh@ Abalone Technologies Pvt Limited
// Description        :
// -------------------------------------------------------------------

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { insertFlightforsale, updateFlightforsale } from '../../../../api/flightsforsale/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import '../../../components/datetimepicker/datetimepicker.js';
import './events_flightsforsale_legs.js';
import './events_flightsforsale_add_leg.js';
import './events_flightsforsale_add.html';
import { Meteor } from 'meteor/meteor';
import { Flightsforsale  } from '../../../../api/flightsforsale/flightsforsale.js';


let legs = new ReactiveVar();
let isLoading = new ReactiveVar(false);
let editId = new ReactiveVar(null);
Template.events_flightsforsale_add.onRendered(function() {
  let editing = FlowRouter.getQueryParam("flightforsaleId");
  // let sub = this.subscribe('airlines.all');
  // let sub2 = this.subscribe('airports.all');
  Meteor.setTimeout(()=>{
    Materialize.updateTextFields();
  }, 100);

  editId.set(editing);
  legs.set([]);
  if(editing) {
    let sub = Meteor.subscribe('flightsforsale.one', editing);
    this.autorun(() => {
      if(sub.ready()) {
	let flight = Flightsforsale.findOne();
	if(flight) {
	  legs.set(flight.flightLegs);
    if(flight.flightIsReturnType==true){

      $('#is_departure_ticket').hide();
    }else{
      $('#is_departure_ticket').show();
    }
	}

      }
    });

  }




});
Template.registerHelper("log", function(something) {
  console.log(something);
});
Template.events_flightsforsale_add.helpers({
  flightInfo() {
    let flight = Flightsforsale.findOne();
    return flight ? flight : {};
  },



  flightLegs() {
    return legs.get();
  },

  flightLegsVar() {
    return legs;
  },

  submitEnabled() {
    return isLoading.get() ? "disabled" : "";
  },

  title() {
    return editId.get() ? "Edit Flight For Sale" : "Add Flight For Sale";
  }
});

Template.events_flightsforsale_add.events({
  'submit #add-flight-for-sale-form'(event, template)  {

    event.preventDefault();
    let data = template.$(event.target).serializeObject();

    data.eventId = FlowRouter.getParam("id");
    data.flightLegs = legs.get();
    isLoading.set(true);
    let edId = editId.get();
    let cbText = edId ? "Flight Updated" : "Flight Added";
    let cb = (err, res) => {
      isLoading.set(false);
      if(err) {
	showError(err);
      }
      else {
	showSuccess(cbText);
	FlowRouter.go('events.flightforsale', { id: FlowRouter.getParam("id") });
      }
    };
    if(edId) {
      data.flightId = edId;
      updateFlightforsale.call(data, cb)
    }
    else {
      insertFlightforsale.call(data, cb);
    }
  },
  'change #add-flight-for-sale-returnType'(event, template)  {
    if($('#add-flight-for-sale-returnType').prop('checked')){
      $('#is_departure_ticket').hide();
    }else{
      $('#is_departure_ticket').show();
    }

  }


});
