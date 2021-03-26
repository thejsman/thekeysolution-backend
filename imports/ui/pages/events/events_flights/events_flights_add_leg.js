import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { Airlines } from '../../../../api/airlines/airlines.js';
import { Airports } from '../../../../api/airports/airports.js';
import { FlightLegSchema } from '../../../../api/flights/schema.js';
import { showError } from '../../../components/notifs/notifications.js';
import { Events } from '../../../../api/events/events.js';
import './events_flights_add_leg.html';
import { ReactiveVar } from 'meteor/reactive-var';
import _ from 'lodash';
import { searchFlight } from '../../../../api/flights/methods.js';

let searchFlightRes = new ReactiveVar([]);
let foundFlights = new ReactiveVar([]);
let selectedFlight = new ReactiveVar([]);

let isLoading = new ReactiveVar(false);
let flightFound = new ReactiveVar(false);
let showRes = new ReactiveVar(false);

function getAirportId(abc){
  let airport = Airports.findOne({
    airportIATA: abc
  });
  return airport._id;
}
import './search.scss';
const Fuse = require('fuse.js');

let defaultDate = new ReactiveVar('');
Template.events_flights_add_leg.onRendered(function () {
  this.subscribe('airlines.all');
  this.$('.modal').modal();
  let self = this;
  this.autorun(() => {
    let event = Events.findOne();
    if (event) {
      defaultDate.set(event.basicDetails.eventStart);
    }
  });
  this.autorun(() => {
    this.subscribe('airports.all');
    self.$('.datepicker').pickadate({
      format: 'yyyy/mm/dd',
      closeOnSelect: true,
      selectYears: 5,
      selectMonths: true,
    });
  })
});

Template.events_flights_add_leg.helpers({
  defaultDate() {
    return defaultDate;
  },

  hasAirlines() {
    return Airlines.find().count() > 0;
  },

  hasAirports() {
    return Airports.find().count() > 0;
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
  foundFlights(){
    return foundFlights.get();
  }
});

Template.airline_list_new.onRendered(function () {
  this.subscribe('airlines.all');
  let airlinel = Airlines.find().fetch();
  // let airports2 = "aaa";
  this.autorun(() => {
    let optionsF = {
      shouldSort: true,
      threshold: 0.4,
      maxPatternLength: 32,
      keys: [{
        name: 'airlineIATA',
        weight: 0.5
      }, {
        name: 'airlineName',
        weight: 0.3
      }, {
        name: 'airlineCountry',
        weight: 0.2
      }]
    };

    let fuse = new Fuse(airlinel, optionsF)

    var ac = this.$('#autocomplete2')
      .on('click', function (e) {
        e.stopPropagation();
      })
      .on('focus keyup', search)
      .on('keydown', onKeyDown);

    let acval = this.$('.value-for-db-airline');
    let airlineCodeForSearch = this.$('#airlineCode');

    var wrap = $('<div>')
      .addClass('autocomplete-wrapper')
      .insertBefore(ac)
      .append(ac);

    var list = $('<div>')
      .addClass('autocomplete-results')
      .on('click', '.autocomplete-result', function (e) {
        e.preventDefault();
        e.stopPropagation();
        selectIndex($(this).data('index'));
      })
      .appendTo(wrap);

    this.$(document)
      .on('mouseover', '.autocomplete-result', function (e) {
        var index = parseInt($(this).data('index'), 10);
        if (!isNaN(index)) {
          list.attr('data-highlight', index);
        }
      })
      .on('click', clearResults);

    function clearResults() {
      results = [];
      numResults = 0;
      list.empty();
    }

    function selectIndex(index) {
      if (results.length >= index + 1) {
        ac.val(results[index].airlineIATA + ', ' + results[index].airlineName + ' - ' + results[index].airlineCountry);
        acval.val(results[index]._id);
        airlineCodeForSearch.val(results[index].airlineIATA);
        clearResults()
      }
    }

    var results = [];
    var numResults = 0;
    var selectedIndex = -1;

    function search(e) {
      if (e.which === 38 || e.which === 13 || e.which === 40) {
        return;
      }

      if (ac.val().length > 0) {
        results = _.take(fuse.search(ac.val()), 5);
        numResults = results.length;
        console.log(results);
        var divs = results.map(function (r, i) {
          return '<div class="autocomplete-result" data-index="' + i + '">'
            + '<div><b>' + r.airlineIATA + '</b> - ' + r.airlineName + '</div>'
            + '<div class="autocomplete-location">' + r.airlineCountry + '</div>'
            + '</div>';
        });

        selectedIndex = -1;
        list.html(divs.join(''))
          .attr('data-highlight', selectedIndex);

      } else {
        numResults = 0;
        list.empty();
      }
    }

    function onKeyDown(e) {
      switch (e.which) {
        case 38: // up
          selectedIndex--;
          if (selectedIndex <= -1) {
            selectedIndex = -1;
          }
          list.attr('data-highlight', selectedIndex);
          break;
        case 13: // enter
          selectIndex(selectedIndex);
          break;
        case 9: // enter
          selectIndex(selectedIndex);
          e.stopPropagation();
          return;
        case 40: // down
          selectedIndex++;
          if (selectedIndex >= numResults) {
            selectedIndex = numResults - 1;
          }
          list.attr('data-highlight', selectedIndex);
          break;

        default: return; // exit this handler for other keys
      }
      e.stopPropagation();
      e.preventDefault(); // prevent the default action (scroll / move caret)
    }
  });
})

// let selectedLeg = [];

Template.events_flights_add_leg.events({
  'click .addLegBtn'(event, template) {
    event.preventDefault();
    $('#add-leg-modal #search-flight').find('input').val('');
    showRes.set(false);
  },
  'click .select_flight'(e, template){
    e.preventDefault();
    let data = selectedFlight.get();
    let arrair = getAirportId(this.arrivalAirportFsCode);
    let depair = getAirportId(this.departureAirportFsCode);
    let agate = this.arrivalGate ? this.arrivalGate : "NA";
    let atime = this.arrivalTime;
    let ater = this.arrivalTerminal ? this.arrivalTerminal : "NA";
    let dgate = this.departureGate ? this.departureGate : "NA";
    let dter = "NA";
    let dtime = this.departureTime;
    let pnr = $('#leg-pnr-input').val();
    
    // Set data
    data.flightArrivalCityId = arrair;
    data.flightArrivalGate = agate;
    data.flightArrivalTerminal = ater;
    data.flightArrivalTime = atime;
    data.flightDepartureCityId = depair;
    data.flightDepartureGate = dgate;
    data.flightDepartureTerminal = dter;
    data.flightDepartureTime = dtime;
    data.pnr = pnr;

    data.flightNo = data.flightNumber;
    delete data.flightNumber;

    data.airlineIATA = data.airlineCode;
    delete data.airlineCode;

    console.log("clickeddd", data)

    data._id = Random.id();
    let context = FlightLegSchema.newContext();
    context.validate(data, { clean: true });
    if (context.isValid()) {
      console.log(template.data);
      let legs = template.data.legs.get();
      legs.push(data);
      template.data.legs.set(legs);
      template.$('.modal').modal('close');
    }
    else {
      console.log(context.validationErrors());
      showError(context.validationErrors()[0].toString());
    }
    Meteor.setTimeout(function () {
      $('.leginfocard .modal').modal();
    }, 500);
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
        console.log("Error ::", err);
      } else {
        let abc = [];
        abc = res.data.scheduledFlights;
        
        abc.sort(function(a,b){
          console.log("ABC is here: ", abc);
          return new Date(a.departureTime) - new Date(b.departureTime);
        });
        
        if(abc.length > 1){
          abc.push({
            arrivalAirportFsCode : abc[abc.length - 1].arrivalAirportFsCode,
            arrivalTime : abc[abc.length - 1].arrivalTime,
            departureAirportFsCode : abc[0].departureAirportFsCode,
            departureTerminal : abc[0].departureTerminal,
            departureTime : abc[0].departureTime
          })
        }

        // Below function will handel flights with 3 legs and will add two more legs of connecting airports
        if(abc.length >= 4) {
          abc.push({
            arrivalAirportFsCode  : abc[1].arrivalAirportFsCode,
            arrivalTerminal       : abc[1].arrivalTerminal,
            arrivalTime           : abc[1].arrivalTime,

            departureAirportFsCode: abc[0].departureAirportFsCode,
            departureTerminal     : abc[0].departureTerminal,
            departureTime         : abc[0].departureTime

          });

          abc.push({
            arrivalAirportFsCode  : abc[2].arrivalAirportFsCode,
            arrivalTerminal       : abc[2].arrivalTerminal,
            arrivalTime           : abc[2].arrivalTime,

            departureAirportFsCode: abc[1].departureAirportFsCode,
            departureTerminal     : abc[1].departureTerminal,
            departureTime         : abc[1].departureTime

          })
        }
        searchFlightRes.set(res.data.scheduledFlights[0])
        foundFlights.set(res.data.scheduledFlights);
        if (searchFlightRes.get()) {
          isLoading.set(false);
          flightFound.set(true);
          console.log("REST API MSGG ", res);
        } else {
          isLoading.set(false);
          flightFound.set(false);
          console.log("FLIGHT NOT FOUND ", res);
        }
      }
    });
  },
});