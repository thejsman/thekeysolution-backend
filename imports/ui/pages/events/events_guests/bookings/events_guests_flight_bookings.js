import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Guests } from '../../../../../api/guests/guests.js';
import { Events } from '../../../../../api/events/events.js';
import { ReactiveVar } from 'meteor/reactive-var';
import { Airports } from '../../../../../api/airports/airports.js';
import { Airlines } from '../../../../../api/airlines/airlines.js';
import { Flights } from '../../../../../api/flights/flights.js';
import { bookFlight, getAvailableFlights, PersonalbookFlight, PersonalRemoveFlightBooking } from '../../../../../api/flights/methods.js';
import { showError, showSuccess } from '../../../../components/notifs/notifications.js';
import { mbox } from '../../../../components/mbox/mbox.js';
import './events_guests_flight_bookings.html';
import './events_guests_bookings.scss';
import '../../../../style/fuse-search.scss';
const Fuse = require('fuse.js');

let flightList2 = new ReactiveVar([]);

var selectedFlight = new ReactiveVar();
var availableSeats = new ReactiveVar(0);
var currentBookingType = new ReactiveVar('individual');
var isLoading = new ReactiveVar(false);
var legs = new ReactiveVar();
var family_ids = new ReactiveVar();

function updateAvailableSeats(eventId, flightId) {
  getAvailableFlights.call({ eventId, flightId }, (err, res) => {
    availableSeats.set(res);
  });
}

Template.guest_flight_info.helpers({
  guestNameVal(id) {
    let guest = Guests.findOne(id);
    return guest.guestFirstName + ' ' + guest.guestLastName;
  },

  getLegs() {
    return this.flight.flightLegs;
  },

  getInfo(leg) {
    let dAirport = Airports.findOne(leg.flightDepartureCityId);
    let dDate = leg.flightDepartureDate;
    let dTime = leg.flightDepartureTime;
    let aAirport = Airports.findOne(leg.flightArrivalCityId);
    let aDate = leg.flightArrivalDate;
    let aTime = leg.flightArrivalTime;
    let flightNo = leg.flightNo;
    let flight = Airlines.findOne({ airlineIATA: leg.airlineIATA });
    let flightPnr = leg.pnr;
    return {
      dAirport: dAirport ? dAirport.airportIATA + ', ' + dAirport.airportLocation + ' - ' + dAirport.airportCountry : "",
      dDate,
      dTime,
      aAirport: aAirport ? aAirport.airportIATA + ', ' + aAirport.airportLocation + ' - ' + aAirport.airportCountry : "",
      aDate,
      flightPnr,
      aTime,
      flightNo,
      flightName: flight ? flight.airlineIATA + ', ' + flight.airlineName : ""
    };
  }
});

Template.guest_flight_info.events({
  'click .click_remove_flight_booking'(event, template) {
    mbox.confirm('Remove flight booking?', function (yes) {
      if (yes) {
        PersonalRemoveFlightBooking.call(template.data.booking._id);
      }
    });
  }
});

Template.agency_guest_flight_add.onRendered(function () {
  legs.set([]);
  this.autorun(function () {
    var eventId = FlowRouter.getParam("id");
    var flightId = selectedFlight.get();
    updateAvailableSeats(eventId, flightId);
  });
});


Template.agency_guest_flight_add.helpers({
  submitEnabled() {
    return isLoading.get() ? "disabled" : "";
  },

  eventHasFlights() {
    let event = Events.findOne();
    let guest = Guests.findOne();
    return event && event.featureDetails && event.featureDetails.selectedFeatures.indexOf('Flight Booking') > -1 && guest && guest.freeFlightTicket;

  },

  individualBooked() {
    return currentBookingType.get() !== 'agency';
  }
});

Template.agency_guest_flight_add.events({
  'submit #add-flight-form'(event, template) {
    event.preventDefault();
    let data = template.$(event.target).serializeObject();
    var guestsData = data.guestFamilyMember;
    var guestsPNR = data.guestFamilyPNR;
    delete data['guestFamilyPNR'];
    delete data['guestFamilyMember'];
    // data.guestId = FlowRouter.getParam("guestId");
    data.eventId = FlowRouter.getParam("id");
    if (currentBookingType.get() === 'individual') {
      if (legs.get().length < 1) {
        showError("Need at least 1 leg for a flight booking");
        return;
      }
      data.flightLegs = legs.get();
    }
    data.agencyProvided = currentBookingType.get() === 'agency';
    isLoading.set(true);

    if (guestsData) {
      if(data.agencyProvided){
        for (var i = 0; i < guestsData.length; i++) {
          if (typeof guestsPNR == 'undefined') {
            showError('Select PNR for selected guests.');
            return
          }
  
          if (typeof guestsPNR[guestsData[i]] == 'undefined') {
            showError('Select PNR for selected guests.');
            return
          }

          data.pnrNumber = guestsPNR[guestsData[i]];
          data.guestId = guestsData[i];
          PersonalbookFlight.call(data, (err, res) => {
            isLoading.set(false);
            if (err) {
              showError(err);
            }
            else {
              template.$('.air-travel-info').hide();
              template.$('#add-new-flight-leg :input').val('');
              event.target.reset();
              showSuccess("Flight Added");
            }
          });
        }
      } else {
        for (var i = 0; i < guestsData.length; i++) {
          data.pnrNumber = 'NA';
          data.guestId = guestsData[i];
          PersonalbookFlight.call(data, (err, res) => {
            isLoading.set(false);
            if (err) {
              showError(err);
            }
            else {
              template.$('.air-travel-info').hide();
              template.$('#add-new-flight-leg :input').val('');
              event.target.reset();
              showSuccess("Flight Added");
            }
          });
        }
      } 
    }
  },

  'change #flight_booking_type'(event, template) {
    let bookingType = event.target.checked ? 'agency' : 'individual';
    currentBookingType.set(bookingType);
  }
});

Template.events_guests_flight_individual_booking_family.events({
  'click .guestFamilyMemberCheckbox'(event, template) {
    if ($('#guestFamilyPNR' + template.data.info._id).prop('readonly')) {
      $('#guestFamilyPNR' + template.data.info._id).attr('readonly', false);

    }
    else {
      $('#guestFamilyPNR' + template.data.info._id).attr('readonly', true);
      $('#guestFamilyPNR' + template.data.info._id).val('');
    }
  }
});


Template.events_guests_flight_individual_booking.onRendered(function () {
  family_ids = [];
});

Template.events_guests_flight_individual_booking.helpers({
  flightLegs() {
    return legs.get();
  },

  flightLegsVar() {
    return legs;
  },

  familyMembers() {
    family_ids = [];
    var all_family_members = Guests.find({}).fetch();
    for (var i = 0; i < all_family_members.length; i++) {
      family = {
        _id: all_family_members[i]._id,
        guestname: all_family_members[i].guestFirstName + ' ' + all_family_members[i].guestLastName
      }
      family_ids.push(family);
    }
    return family_ids
  }

});

Template.flight_list_new.onRendered(function(){
  let airlinel = flightList2.get();
  this.autorun(() => {
    let optionsF = {
      shouldSort: true,
      threshold: 0.4,
      maxPatternLength: 32,
      keys: [{
        name: 'pnr',
        weight: 0.5
      }, {
        name: 'airline',
        weight: 0.3
      }, {
        name: 'class',
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

    let acval = this.$('#guest_flight_name');
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
        ac.val(results[index].pnr + ', ' + results[index].airline + ' - ' + results[index].class);
        acval.val(results[index]._id);
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
        var divs = results.map(function (r, i) {
          return '<div class="autocomplete-result" data-index="' + i + '">'
            + '<div><b> PNR : ' + r.pnr + '</b> - ' + r.airline + ', ' + r.class +'</div>'
            + '<div class="autocomplete-location">' + r.leg + '</div>'
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
        case 38:
          selectedIndex--;
          if (selectedIndex <= -1) {
            selectedIndex = -1;
          }
          list.attr('data-highlight', selectedIndex);
          break;
        case 13:
          selectIndex(selectedIndex);
          break;
        case 9:
          selectIndex(selectedIndex);
          e.stopPropagation();
          return;
        case 40:
          selectedIndex++;
          if (selectedIndex >= numResults) {
            selectedIndex = numResults - 1;
          }
          list.attr('data-highlight', selectedIndex);
          break;

        default: return;
      }
      e.stopPropagation();
      e.preventDefault();
    }
  });
})

Template.events_guests_flight_agency_booking.onRendered(function () {
  this.autorun(() => {
    let flightCount = Flights.find().count();
    let selected = selectedFlight.get();
    Meteor.setTimeout(() => {
      this.$('select').material_select();
    }, 1);
  });
  let airlinel = flightList2.get();
  // let airports2 = "aaa";
  this.autorun(() => {
    let optionsF = {
      shouldSort: true,
      threshold: 0.4,
      maxPatternLength: 32,
      keys: [{
        name: 'pnr',
        weight: 0.5
      }, {
        name: 'airline',
        weight: 0.3
      }, {
        name: 'class',
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

    let acval = this.$('#guest_flight_name');
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
        ac.val(results[index].pnr + ', ' + results[index].airline + ' - ' + results[index].class);
        acval.val(results[index]._id);
        selectedFlight.set(results[index]._id)
        $('.select-wrapper').addClass('hide-input');
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
        var divs = results.map(function (r, i) {
          return '<div class="autocomplete-result" data-index="' + i + '">'
            + '<div><b> PNR : ' + r.pnr + '</b> - ' + r.airline + ', ' + r.class +'</div>'
            + '<div class="autocomplete-location">' + r.leg + '</div>'
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
        case 38:
          selectedIndex--;
          if (selectedIndex <= -1) {
            selectedIndex = -1;
          }
          list.attr('data-highlight', selectedIndex);
          break;
        case 13:
          selectIndex(selectedIndex);
          break;
        case 9:
          selectIndex(selectedIndex);
          e.stopPropagation();
          return;
        case 40:
          selectedIndex++;
          if (selectedIndex >= numResults) {
            selectedIndex = numResults - 1;
          }
          list.attr('data-highlight', selectedIndex);
          break;

        default: return;
      }
      e.stopPropagation();
      e.preventDefault();
    }
  });
});

Template.events_guests_flight_agency_booking.events({
  'change #guest_flight_name'(event, template) {
    var flightId = template.$(event.target).val();
    selectedFlight.set(flightId);
  }
});

Template.events_guests_flight_agency_booking.helpers({
  familyMembers() {
    family_ids = [];
    var all_family_members = Guests.find({}).fetch();
    for (var i = 0; i < all_family_members.length; i++) {
      family = {
        _id: all_family_members[i]._id,
        guestname: all_family_members[i].guestFirstName + ' ' + all_family_members[i].guestLastName
      }
      family_ids.push(family);
    }
    return family_ids
  },

  flightList() {
    var flights = Flights.find();
    if (flights.count() > 0) {
      var flightElements = flights.fetch();
      selectedFlight.set(flightElements[0]._id);
    }
    return flights;
  },

  flightLegs(flight) {
    if (!flight) return "";
    let legs = flight.flightLegs;
    if (legs.length < 1) return "";
    let list = "";
    let airline = Airlines.findOne(legs[0].flightId);

    let flightPNR = flight.flightPNRs[0];
    let flightClass = flight.flightIsBusiness;

    list += (flightClass ? "Economy Class - " : "Business Class -") + (airline ? airline.airlineName : "") + ", PNR : " + flightPNR + ", "
    legs.forEach((l, index) => {
      let dAirport = Airports.findOne(l.flightDepartureCityId);
      let aAirport = Airports.findOne(l.flightArrivalCityId);
      let flightNo = l.flightNo;
      list += "Flight No.: " + flightNo + " " + dAirport.airportIATA + '->' + aAirport.airportIATA;
      if (index !== legs.length - 1) {
        list += ', ';
      }
    });
    return {
      _id: flight._id,
      text: list
    };
  },

  availableSeats() {
    return availableSeats.get();
  },


});

Template.events_guests_flight_agency_booking_family.helpers({
  pnrList() {
    let flight = Flights.findOne({
      _id: selectedFlight.get()
    });
    if (flight) {
      return flight.flightPNRs;
    }
    else {
      return [];
    }
  }
});

Template.events_guests_flight_agency_booking_family.events({  //new
  'click .agencyBookingFamilyMemberCheckbox'(event, template) {
    if ($('#agencyBookingFamilyPNR' + template.data.info._id).prop('disabled')) {
      $('#agencyBookingFamilyPNR' + template.data.info._id).removeAttr('disabled');
      $('#agencyBookingFamilyPNR' + template.data.info._id).material_select();

    }
    else {
      $('#agencyBookingFamilyPNR' + template.data.info._id).val('');
      $('#agencyBookingFamilyPNR' + template.data.info._id).attr('disabled', true);
      $('#agencyBookingFamilyPNR' + template.data.info._id).material_select();

    }
  }
});

function flightListUpdate(){
  let flights = Flights.find().fetch();
  let flightList = [];
  flights.map(flight => {
    let legs = flight.flightLegs;
    if (legs.length < 1) return "";
    let legInfo = "";
    let airline = Airlines.findOne(legs[0].flightId);
    let flightPNR = flight.flightPNRs[0];
    let flightClass = flight.flightIsBusiness;
    legs.forEach((l, index) => {
      let dAirport = Airports.findOne(l.flightDepartureCityId);
      let aAirport = Airports.findOne(l.flightArrivalCityId);
      let flightNo = l.flightNo;
      legInfo +=  "Flight No.: " + flightNo + " " + dAirport.airportIATA + '->' + aAirport.airportIATA;
      if (index !== legs.length - 1) {
        legInfo += ', ';
      }
    });
    flightList.push({
      _id: flight._id,
      airline : airline.airlineName,
      pnr : flightPNR,
      class : (flightClass ? "Economy Class - " : "Business Class"),
      leg : legInfo
    })
  })
  flightList2.set(flightList)
}

Template.events_guests_flight_agency_booking_family.onRendered(function () {
  $('.agencyBookingFamilySelect').attr('disabled', 'disabled');
  this.$('.agencyBookingFamilySelect').material_select();
  this.autorun(() => {
    flightListUpdate();
    console.log('Flight List ::', flightList2.get())
  })
})
