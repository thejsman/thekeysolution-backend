import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { insertFlight, updateFlight } from '../../../../api/flights/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import '../../../components/datetimepicker/datetimepicker.js';
import './events_flights_legs.js';
import './events_flights_add_leg.js';
import './events_flights_add.html';
import { Meteor } from 'meteor/meteor';
import { Flights } from '../../../../api/flights/flights.js';
import './search.scss';

let legs = new ReactiveVar();
let isLoading = new ReactiveVar(false);
let editId = new ReactiveVar(null);
let flight = new ReactiveVar();
Template.events_flights_add.onRendered(function () {
  let editing = FlowRouter.getQueryParam("flightId");
  Meteor.setTimeout(() => {
    Materialize.updateTextFields();
    this.$('.tooltip-icon').tooltip({ delay: 50 });
    this.$('.tooltipped').tooltip({ delay: 50 });
  }, 100);

  editId.set(editing);
  legs.set([]);
  if (editing) {
    let sub = Meteor.subscribe('flights.one', editing);
    this.autorun(() => {
      if (sub.ready()) {
        flight = Flights.findOne({ _id: editing });
        if (flight) {
          legs.set(flight.flightLegs);
        }
      }
    });
  }
});

Template.events_flights_add.helpers({
  flightInfo() {
    let flight = Flights.findOne({ _id: editId.curValue });
    return flight ? flight : {};
  },

  getPnrs(flight) {
    if (flight.flightPNRs) {
      return flight.flightPNRs.join();
    }
    else {
      return "";
    }
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
    return editId.get() ? "Edit Flight" : "Flight Inventory";
  }
});

Template.events_flights_add.events({
  'submit #add-flight-form'(event, template) {
    event.preventDefault();
    let data = template.$(event.target).serializeObject();
    data.eventId = FlowRouter.getParam("id");
    data.flightLegs = legs.get();
    data.flightIsGroupPNR = !!data.flightIsGroupPNR;
    data.flightIsBusiness = !!data.flightIsBusiness;
    data.flightPNRs = data.flightPNRs.split(',');
    isLoading.set(true);
    let edId = editId.get();
    let cbText = edId ? "Flight Updated" : "Flight Added";
    let cb = (err, res) => {
      isLoading.set(false);
      if (err) {
        showError(err);
      }
      else {
        showSuccess(cbText);
        FlowRouter.go('events.flight', { id: FlowRouter.getParam("id") });
      }
    };
    if (edId) {
      data.flightId = edId;
      updateFlight.call(data, cb)
    }
    else {
      insertFlight.call(data, cb);
    }
  }
});