// Time-stamp: 2018-02-12
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_flights_add_leg.js
// Original Author    : saurabh@ Abalone Technologies Pvt Limited
// Description        :
// -------------------------------------------------------------------

import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Airlines } from '../../../../api/airlines/airlines.js';
import { Airports } from '../../../../api/airports/airports.js';
import { FlightforsaleLegSchema } from '../../../../api/flightsforsale/schema.js';
import { showError } from '../../../components/notifs/notifications.js';
import { Events } from '../../../../api/events/events.js';
import './events_flightsforsale_add_leg.html';
import { ReactiveVar } from 'meteor/reactive-var';
import _ from 'lodash';

let defaultDate = new ReactiveVar('');
// Add controls to from and to times
Template.events_flightsforsale_add_leg.onRendered(function() {
  this.$('.modal').modal();
  this.$('.datepicker').pickadate();
  this.$('.timepicker').pickatime();
  let count = 0;
  let count2 = 0;
  let self = this;
  self.$('.airline-select').select2();
  self.$('.airport-select').select2();
  this.autorun(() => {
    let airports = Airports.find();
    Meteor.setTimeout(() => {

      self.$('.airline-select').select2();
      self.$('.airport-select').select2();
    },1);
  });
  this.autorun(()=> {
    let event = Events.findOne();
    if(event) {
      defaultDate.set(event.basicDetails.eventStart);
    }
  });
});

Template.events_flightsforsale_add_leg.helpers({
  airlineList() {
    return Airlines.find();
  },

  airportList() {
    return Airports.find();
  },

  defaultDate() {
    return defaultDate;
  }

});

Template.events_flightsforsale_add_leg.events({
  'submit #add-new-flight-leg'(event, template) {
    event.preventDefault();

    let data = template.$(event.target).serializeObject();

    data._id = Random.id();
    let context = FlightforsaleLegSchema.newContext();
    context.validate(data, { clean : true });
    if(context.isValid()) {
      let legs = template.data.legs.get();
      legs.push(data);
      template.data.legs.set(legs);
      template.$('.modal').modal('close');
    }
    else {
      console.log(context.validationErrors());
      showError(context.validationErrors()[0].toString());
    }
  },

  'click #swap-flight-info'(event, template) {
    let ex = {
      'flight-departure-select': 'flight-arrival-select',
      'airline_departure_time': 'airline_arrival_time',
      'airline_departure_gate': 'airline_arrival_gate',
      'airline_departure_terminal': 'airline_arrival_terminal'
    }

    _.each(ex,(val, key) => {
      let item1 = template.$(`#${val}`);
      let item2 = template.$(`#${key}`);
      exchange(item1, item2);
    });
  },
  'change #airline_arrival_time'(event,template){
    // let aTime=$('#airline_arrival_time');
    // let dTime=$('#airline_arrival_time');
    // if(aTime.length>0 && dTime.length>0){
    //   let arrivalTime = moment(aTime, "YYYY-MM-DD HH:mm a");
    //   let departureTime = moment(dTime, "YYYY-MM-DD HH:mm a");
    //   let duration = moment.duration(departureTime.diff(arrivalTime));
    //   let hours = duration.humanize();
    //   $('#flightDuration').html(hours);
    // }

  },
  'change #airline_departure_time'(event,template){

  }

});

function exchange(a,b) {
  let temp = a.val();
  a.val(b.val()).change();
  b.val(temp).change();
}
