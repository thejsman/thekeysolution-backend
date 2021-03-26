// Time-stamp: 2017-10-09
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_guests_flight_bookings.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------
import {
    Template
} from 'meteor/templating';
import {
    Meteor
} from 'meteor/meteor';
import {
    FlowRouter
} from 'meteor/kadira:flow-router';
import {
    Guests
} from '../../../../../api/guests/guests.js';
import {
    ReactiveVar
} from 'meteor/reactive-var';
import {
    Airports
} from '../../../../../api/airports/airports.js';
import {
    Airlines
} from '../../../../../api/airlines/airlines.js';
import {
    Flightsforsale
} from '../../../../../api/flightsforsale/flightsforsale.js';
import {
    bookFlightforsale,
    getAvailableFlights as getAvailableFlightsforsale,
    PersonalbookFlightforsale as PersonalbookFlight,GroupbookFlightforsale,
    PersonalRemoveFlightforsaleBooking
} from '../../../../../api/flightsforsale/methods.js';
import {
    showError,
    showSuccess
} from '../../../../components/notifs/notifications.js';
import {
    mbox
} from '../../../../components/mbox/mbox.js';
import './events_guests_flightforsale_bookings.html';
import {
    Events
} from '../../../../../api/events/events.js';
var selectedFlight = new ReactiveVar();
var availableSeats = new ReactiveVar(0);
var currentBookingType = new ReactiveVar('individual');
var isLoading = new ReactiveVar(false);
var legs = new ReactiveVar();

function updateAvailableSeats(eventId, flightId) {
    getAvailableFlightsforsale.call({
        eventId,
        flightId
    }, (err, res) => {
        availableSeats.set(res);
    });
}
Template.guest_flightforsale_info.helpers({
    getAirport(airportId) {
        let airport = Airports.findOne(airportId)
    },
    getLegs() {
        return this.flight.flightLegs;
    },
    getInfo(leg) {
        let dAirport = Airports.findOne(leg.flightDepartureCityId);
        let dTime = leg.flightDepartureTime;
        let aAirport = Airports.findOne(leg.flightArrivalCityId);
        let aTime = leg.flightArrivalTime;
        let flightNo = leg.flightNo;
        let flight = Airlines.findOne(leg.flightId);
        let flightPNR = leg.flightPNR;
        return {
            dAirport: dAirport ? dAirport.airportName : "",
            dTime,
            aAirport: aAirport ? aAirport.airportName : "",
            aTime,
            flightNo,
            flightPNR,
            flightName: flight ? flight.airlineName : ""
        };
    }
});
Template.guest_flightforsale_info.events({
    'click .click_remove_flightforsale_booking' (event, template) {
        mbox.confirm('Remove flight booking?', function(yes) {
            if (yes) {
                PersonalRemoveFlightforsaleBooking.call(template.data.booking._id);
            }
        });
    }
});
Template.agency_guest_flightforsale_add.onRendered(function() {
    legs.set([]);
    this.autorun(function() {
        var eventId = FlowRouter.getParam("id");
        var flightId = selectedFlight.get();
        updateAvailableSeats(eventId, flightId);
    });
});
Template.agency_guest_flightforsale_add.helpers({
    submitEnabled() {
        return isLoading.get() ? "disabled" : "";
    },
    individualBooked() {
        return currentBookingType.get() !== 'agency';
    },
    guestFamilyMember() {
      let current_guest=Guests.findOne();
     
      if(current_guest && current_guest.guestIsPrimary){
        return Guests.find();
      }else{
        return [current_guest];
      }
        
      }
    
});
function showFlightBookingResponse(bulkErrorCount,successBookCount,guestIds){
  if(bulkErrorCount==0 && successBookCount==guestIds.length){
              showSuccess('Flight Booked successfully!');
            }else if(bulkErrorCount){
              showError("Flight Booked: "+successBookCount+" of "+guestIds.length+" "+bulkErrorMsg);
            }
}
Template.agency_guest_flightforsale_add.events({
    'submit #add-flightforsale-form' (event, template) {
        event.preventDefault();
        let guestIds = [];
        $('input[name="guestFamilyMember[]"]').each(function(element) {
            if ($(this).prop('checked')) {
                guestIds.push($(this).val());
            }
        });
        let selectedFlightId=$('#guest_flightforsale_name').val();
        if(typeof selectedFlightId == 'undefined'  || selectedFlightId==null || selectedFlightId.length==0){
          showError('Select a flight for booking');
          return;
        }
        if (guestIds.length == 0) {
            showError('Select atleast one family memeber to book flight!');
            return;
        } else {
            let bulkErrorCount = 0;
            let bulkErrorMsg = "";
            let successBookCount = 0;
          
                let data = template.$(event.target).serializeObject();
               
                data.eventId = FlowRouter.getParam("id");
                data.agencyProvided = true;
                isLoading.set(true);
                if (data.eventId) {
                    var event = Events.findOne(data.eventId);
                    var name = event ? event.basicDetails.eventName.replace(/ /g, '').substring(0, 3).toUpperCase() : '';
                    var date = new Date();
                    data.flightBookingReferenceNo = date.getTime();
                    data.flightBookingReferenceNo = 'FFS' + name + data.flightBookingReferenceNo;
                    var flight = Flightsforsale.findOne(selectedFlight.get());
                    if (flight) {
                        data.flightBookCost = flight.flightCostPerTicket;
                    }
                }
                data.guestIds=data.guestFamilyMember;
                delete data.guestFamilyMember;
                let processed=0; 
                console.log('bookingData',data);
                GroupbookFlightforsale.call(data, (err, res) => {
                    // isLoading.set(false);
                    if (err) {
                       showError(err); 
                       return;
                    }else{
                         showSuccess("Booking done sucessfully!"); 
                         return;
                    }
                });
        }
        return true;
    },
});
Template.events_guests_flight_agency_booking.onRendered(function() {
    this.autorun(() => {
        let flightCount = Flightsforsale.find().count();
        let selected = selectedFlight.get();
        Meteor.setTimeout(() => {
            this.$('select').material_select();
        }, 1);
    });
    // this.subscribe('airports.all');
});
Template.events_guests_flightforsale_agency_booking.events({
    'change #guest_flightforsale_name' (event, template) {
        var flightId = template.$(event.target).val();
        selectedFlight.set(flightId);
    }
});
Template.events_guests_flightforsale_agency_booking.helpers({
    flightforsaleList() {
        var flights = Flightsforsale.find();
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
        let flightNo = legs[0].flightNo;
        list += (airline ? airline.airlineName : "") + " " + flightNo + ", "
        legs.forEach((l, index) => {
            let dAirport = Airports.findOne(l.flightDepartureCityId);
            let aAirport = Airports.findOne(l.flightArrivalCityId);
            if (typeof dAirport != 'undefined' && typeof aAirport != 'undefined') {
                list += dAirport.airportIATA + '->' + aAirport.airportIATA;
            }
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