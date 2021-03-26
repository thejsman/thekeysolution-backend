// Time-stamp: 2017-08-26
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_flights.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Flights } from '../../../../api/flights/flights.js';
import { Airports } from '../../../../api/airports/airports.js';
import { deleteFlight, getAvailableFlights } from '../../../../api/flights/methods.js';
import './events_flights.scss';
import './events_flights_add_leg.js';
import './events_flights.html';
import { ReactiveVar } from 'meteor/reactive-var';

Template.events_flights.onRendered(function() {
  this.subscribe('flights.all', FlowRouter.getParam("id"));
  // this.subscribe('airports.all');
  // this.subscribe('airlines.all');
});

Template.events_flights.helpers({
  flightList() {
    return Flights.find();
  },

  flightAddPath() {
    return FlowRouter.path('events.flight.add', { id: FlowRouter.getParam("id") });
  }
});

Template.flight_card.onCreated(function(){
  this.available = new ReactiveVar(0);
});

Template.flight_card.onRendered(function() {
  let eventId = FlowRouter.getParam("id");
  let flightId = this.data.flight._id;
  getAvailableFlights.call({ eventId, flightId}, (err, res) => {
    if(!err) {
      this.available.set(res);
    }
  });
});

Template.flight_card.helpers({
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

  flightEditPath() {
    let eventId = FlowRouter.getParam("id");
    let queryParams = {
      flightId: this.flight._id
    };
    return FlowRouter.path(`/events/:id/flights/add`, { id: eventId }, queryParams);
  },

  flightEnd() {
    let legs = this.flight.flightLegs;
    let airport = Airports.findOne({
      _id: legs[legs.length - 1].flightArrivalCityId
    });
    return airport;
  },

  flightReserved(){
    return this.flight.flightTotalSeats;
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

Template.flight_card.events({
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
