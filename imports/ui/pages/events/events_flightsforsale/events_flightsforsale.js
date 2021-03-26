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
import { Flightsforsale } from '../../../../api/flightsforsale/flightsforsale.js';
import { Airports } from '../../../../api/airports/airports.js';
import { deleteFlightforsale as deleteFlight, getAvailableFlights } from '../../../../api/flightsforsale/methods.js';
import './events_flightsforsale.scss';
import './events_flightsforsale_add_leg.js';
import './events_flightsforsale.html';
import { ReactiveVar } from 'meteor/reactive-var';

Template.events_flightsforsale.onRendered(function() {
  this.subscribe('flightsforsale.all', FlowRouter.getParam("id"));
  // this.subscribe('airports.all',FlowRouter.getParam("id"));
  // this.subscribe('airlines.all');
});

Template.events_flightsforsale.helpers({
  flightforsaleList() {
    console.log(Flightsforsale.find());
    return Flightsforsale.find();
  },

  flightforsaleAddPath() {
    return FlowRouter.path('events.flightforsale.add', { id: FlowRouter.getParam("id") });
  }
});

Template.flightforsale_card.onCreated(function(){
  this.available = new ReactiveVar(0);
});

Template.flightforsale_card.onRendered(function() {
  let eventId = FlowRouter.getParam("id");
  let flightId = this.data.flight._id;
  getAvailableFlights.call({ eventId, flightId}, (err, res) => {
    if(!err) {
      this.available.set(res);
    }
  });
});

Template.flightforsale_card.helpers({
  flightLegs() {
    let legs = this.flight.flightLegs;
    return legs.map((l) => {
      let arrivalCity = Airports.findOne(l.flightArrivalCityId);
      let departureCity = Airports.findOne(l.flightDepartureCityId)
      console.log(arrivalCity);
      return {
	departureCity,
	departureTime: l.flightDepartureTime,
	arrivalCity,
	arrivalTime: l.flightArrivalTime
      };
    });
  },

  flightStart() {
    let legs = this.flight.flightLegs;
    let airport = Airports.findOne({
      _id: legs[0].flightDepartureCityId
    });
    return airport;
  },

  flightforsaleEditPath() {
    let eventId = FlowRouter.getParam("id");
    let queryParams = {
      flightforsaleId: this.flight._id
    };
    return FlowRouter.path(`/events/:id/flightsforsale/add`, { id: eventId }, queryParams);
  },

  flightEnd() {
    let legs = this.flight.flightLegs;
    let airport = Airports.findOne({
      _id: legs[legs.length - 1].flightArrivalCityId
    });
    return airport;
  },

  flightReserved(){
    return this.flight.flightTotalTicketQty;
  },

  flightArrival(){
    let legs = this.flight.flightLegs;
    return legs[legs.length - 1].flightArrivalTime;
  },

  flightDeparture() {
    let legs = this.flight.flightLegs;
    return legs[0].flightDepartureTime;
  },

  flightAvailable() {
    return Template.instance().available.get();
  }
});

Template.flightforsale_card.events({
  'click .click_delete-flight'(event, template) {
    mbox.confirm("Are you sure?", (yes) => {
      if(!yes) return;
      else {
	deleteFlight.call(template.data.flight._id, (err, res) => {
	});
      }
    });
  }
});
