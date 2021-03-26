import { Template } from 'meteor/templating';
import moment from 'moment';
import _ from 'lodash';
import './events_flights.scss';
import './events_flights_legs.html';
import { Airlines } from '../../../../api/airlines/airlines.js';
import { Airports } from '../../../../api/airports/airports.js';
import { FlightLegSchema } from '../../../../api/flights/schema.js';
import { Random } from 'meteor/random';
import { showError } from '../../../components/notifs/notifications.js';
import { ReactiveVar } from 'meteor/reactive-var';
import { searchFlight } from '../../../../api/flights/methods.js';

let searchFlightRes = new ReactiveVar([]);
let foundFlights = new ReactiveVar([]);
let selectedFlight = new ReactiveVar([]);

let legIndex = new ReactiveVar();
let isLoading = new ReactiveVar(false);
let flightFound = new ReactiveVar(false);
let showRes = new ReactiveVar(false);

function getAirportId(abc) {
  let airport = Airports.findOne({
    airportIATA: abc
  });
  return airport._id;
}

Template.events_flights_legs.helpers({
  airlineList() {
    return Airlines.find();
  },
  airportList() {
    return Airports.find();
  },
  hasAirlines() {
    return Airlines.find().count() > 0;
  },
  hasAirports() {
    return Airports.find().count() > 0;
  },
  layover(index) {
    if (index >= this.legs.length - 1) {
      return false;
    }
    return true;
  },
  layoverTime(leg, index) {
    let next = this.legs[index + 1];
    let arrivalTime = moment(leg.flightArrivalTime, "YYYY-MM-DD HH:mm a");
    let departureTime = moment(next.flightDepartureTime, "YYYY-MM-DD HH:mm a");
    let duration = moment.duration(departureTime.diff(arrivalTime));
    let hours = duration.humanize();
    return hours;
  },
  legAirline(leg) {
    let legAirline = Airlines.findOne({
      _id: leg.flightId
    });
    return legAirline.airlineIATA;
  },
  isLoading() {
    return isLoading.get();
  },
  flightFound() {
    return flightFound.get();
  },
  showRes() {
    return showRes.get();
  },
  foundFlights() {
    return foundFlights.get();
  }
});

Template.events_flights_legs.events({
  'click .delete-button'(event, template) {
    let legs = template.data.legsVar.get();
    _.remove(legs, leg => {
      return leg._id === event.target.id;
    });
    template.data.legsVar.set(legs);
  },

  'click .flightEditBtn,.flightEditBtn i'(event) {
    showRes.set(false);

  },
  'submit #search-flight'(event, template) {
    event.preventDefault();
    let data = template.$(event.target).serializeObject();
    let airlineCode = data.airlineCode;
    let flightNo = data.flightNumber;
    let date = data.flightDate.toString();
    selectedFlight.set(data);
    isLoading.set(true);
    flightFound.set(false);
    showRes.set(true);
    searchFlight.call({
      airlineCode: airlineCode,
      flightNo: flightNo,
      date: date
    }, (err, res) => {
      if (err) {
      } else {
        let abc = [];
        abc = res.data.scheduledFlights;
        if (abc.length > 1) {
          abc.push({
            arrivalAirportFsCode: abc[abc.length - 1].arrivalAirportFsCode,
            arrivalTime: abc[abc.length - 1].arrivalTime,
            departureAirportFsCode: abc[0].departureAirportFsCode,
            departureTerminal: abc[0].departureTerminal,
            departureTime: abc[0].departureTime
          })
        }
        searchFlightRes.set(res.data.scheduledFlights[0])
        foundFlights.set(res.data.scheduledFlights);
        if (searchFlightRes.get()) {
          isLoading.set(false);
          flightFound.set(true);
        } else {
          isLoading.set(false);
          flightFound.set(false);
        }
      }
    });
  },
  'click .select_flight'(event, template) {
    event.preventDefault();
    let data = selectedFlight.get();
    let arrair = getAirportId(this.arrivalAirportFsCode);
    let depair = getAirportId(this.departureAirportFsCode);
    let agate = this.arrivalGate ? this.arrivalGate : "NA";
    let atime = this.arrivalTime;
    let ater = this.arrivalTerminal ? this.arrivalTerminal : "NA";
    let dgate = this.departureGate ? this.departureGate : "NA";
    let dter = "NA";
    let dtime = this.departureTime;


    // Set data
    data.flightArrivalCityId = arrair;
    data.flightArrivalGate = agate;
    data.flightArrivalTerminal = ater;
    data.flightArrivalTime = atime;
    data.flightDepartureCityId = depair;
    data.flightDepartureGate = dgate;
    data.flightDepartureTerminal = dter;
    data.flightDepartureTime = dtime;

    data.flightNo = data.flightNumber;
    delete data.flightNumber;

    data.airlineIATA = data.airlineCode;
    delete data.airlineCode;
    legIndex = data.legIndex;
    delete data.legIndex;
    data._id = Random.id();
    let context = FlightLegSchema.newContext();
    context.validate(data, { clean: true });
    if (context.isValid()) {
      let legs = template.data.legsVar.get();
      if (!isNaN(legIndex) && typeof legs != 'undefined') {
        legs.forEach(function (leg, index) {
          if (index == legIndex) {
            delete legs[index];
            legs[index] = data;
          }
        });
      } else {

      }

      template.data.legsVar.set(legs);
      template.$('.modal').modal('close');
    }
    else {
      showError(context.validationErrors()[0].toString());
    }

    Meteor.setTimeout(function () {
      $('.leginfocard .modal').modal();
    }, 500);
  },
});

Template.events_flights_legs.onRendered(function () {
  Meteor.setTimeout(() => {
    $('.sucess-msg-box').hide();
    $('.error-msg-box').hide();
    $('.leginfocard .modal').modal();
    $('.flightEditBtn').each(function () {
      $('#edit-leg-modal' + $(this).attr('id') + ' #edit-flight-name-select').val($(this).attr('flightId'));
      $('#edit-leg-modal' + $(this).attr('id') + ' #flightDepartureCityId').val($(this).attr('flightDepartureCityId'));
      $('#edit-leg-modal' + $(this).attr('id') + ' #flightArrivalCityId').val($(this).attr('flightArrivalCityId'));
      $('#edit-leg-modal' + $(this).attr('id') + ' #airline_departure_time').val($(this).attr('flightDepartureTime'));
      $('#edit-leg-modal' + $(this).attr('id') + ' #airline_arrival_time').val($(this).attr('flightArrivalTime'));
    });
    $('.datepicker').pickadate({
      format: 'yyyy/mm/dd',
      closeOnSelect: true,
      selectYears: 5,
      selectMonths: true,
    });
  }, 500);
});