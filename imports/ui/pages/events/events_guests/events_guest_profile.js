import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Guests } from '../../../../api/guests/guests.js';
import { Events } from '../../../../api/events/events.js';
import { ReactiveVar } from 'meteor/reactive-var';
import { Airports } from '../../../../api/airports/airports.js';
import { Gifts } from '../../../../api/gifts/gifts.js';
import { GiftBookings } from '../../../../api/gifts/giftBooking.js';
import { Foods } from '../../../../api/foods/foods.js';
import { FoodBookings } from '../../../../api/foods/foodBooking.js';
import { Sizes } from '../../../../api/sizes/sizes.js';
import { SizeBookings } from '../../../../api/sizes/sizeBooking.js';
import { PassportBookings } from '../../../../api/passports/passportBooking.js';
import { VisaBookings } from '../../../../api/visas/visaBooking.js';
import { InsuranceBookings } from '../../../../api/insurances/insuranceBooking.js';

import { Flights } from '../../../../api/flights/flights.js';
import { Flightsforsale } from '../../../../api/flightsforsale/flightsforsale.js';

import { TransportDrivers } from '../../../../api/transport/transport_drivers.js';
import { driverBookings } from '../../../../api/transport/driverBooking.js';
import { bookServices } from '../../../../api/services/methods.js';
import { TransportVehicles } from '../../../../api/transport/transport_vehicles.js';
import { Services } from '../../../../api/services/services.js'
import { VehicleBookings } from '../../../../api/transport/vehicleBooking.js';
import { serviceBookings } from '../../../../api/services/serviceBooking.js';
import { FlightBookings } from '../../../../api/flights/flightBookings.js';
import { FlightforsaleBookings } from '../../../../api/flightsforsale/flightforsaleBookings.js';

import {sendGuestInvitation } from '../../../../api/adminusers/methods.js';
import { insertGuestMembers } from '../../../../api/guests/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';

import './events_guest_profile_family_members.js';
import './events_guest_profile_preferences.js';
import './events_guest_profile_room_preference.js';
import './events_guest_profile_passport.js';
import './events_guest_profile_visa.js';
import './events_guest_profile_insurance.js';
import './events_guest_profile_transport.js';
import './events_guest_profile.html';
import './events_guest_profile_add_family.html';
import './events_guest_profile.scss';
import '../events_flights/events_flights.js';
import './bookings/events_guests_flight_bookings.js';
import '../events_flightsforsale/events_flightsforsale.js';
import './bookings/events_guests_flightforsale_bookings.js';
import './bookings/events_guests_hotel_bookings.js';
import './bookings/events_guests_hotelforsale_bookings.js';

import './bookings/events_guest_service_bookings.js';
import './bookings/events_guests_gifts.js';
import './bookings/events_guests_rsvp.js';


let isLoading = new ReactiveVar(false);
var selectedContact = new ReactiveVar();
var selectedContactN = new ReactiveVar();
var selectedAddress1 = new ReactiveVar();
var selectedAddress2 = new ReactiveVar();
var selectedcity = new ReactiveVar();
var selectedstate = new ReactiveVar();
var selectedPincode = new ReactiveVar();
var selectedLandmark = new ReactiveVar();
var refreshSelect = new ReactiveVar(false);
var family_ids = new ReactiveVar();

Template.events_guest_profile.onRendered(function () {
  const handle = this.subscribe('guests.one', FlowRouter.getParam("guestId"), FlowRouter.getParam("id"));
  this.subscribe('flightsforsale.all', FlowRouter.getParam("id"));
  this.subscribe('flightforsale.bookings.guest', FlowRouter.getParam("guestId"));
  this.subscribe('flight.bookings.guest', FlowRouter.getParam("guestId"));
  this.subscribe('flight.all', FlowRouter.getParam("id"));
  family_ids = [];
  this.autorun(() => {
    family_ids = [];
    const isReady = handle.ready();
    if (isReady) {
      var all_family_members = Guests.find({}).fetch();
      for (var i = 0; i < all_family_members.length; i++) {
        family_ids.push(all_family_members[i]._id);
      }
    }
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
    }, 100);
  });
});

Template.events_guest_profile.helpers({
  guestDetails() {
    return Guests.findOne({
      _id: FlowRouter.getParam("guestId")
    });
  },

  guestFlightImages() {
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    if (guest && ((guest.TicketsArrival && guest.TicketsArrival.length > 0) || (guest.TicketsDeparture && guest.TicketsDeparture.length > 0))) {
      let list = [];
      if (guest.TicketsArrival) list.push(guest.TicketsArrival);
      if (guest.TicketsDeparture) list.push(guest.TicketsDeparture);
      return list;
    }
    return false;
  },

  eventHasFlights() {
    let event = Events.findOne();
    return event && event.featureDetails && event.featureDetails.selectedFeatures.indexOf('Flight Booking') > -1;
  },

  eventHasPaidFlights() {
    let event = Events.findOne();
    return event && event.featureDetails && event.featureDetails.selectedFeatures.indexOf('Flight Booking Paid') > -1;
  },

  eventHasHotels() {
    let event = Events.findOne();
    return event && event.featureDetails && event.featureDetails.selectedFeatures.indexOf('Hotel Booking') > -1;
  },

  showPaidFlight() {
    let guest = Guests.findOne({
      _id: FlowRouter.getParam("guestId")
    });

    if (typeof guest != 'undefined' && guest.freeFlightTicket == true) {
      return false;
    } else {
      return true;
    }
  },
  showPaidHotel() {
    let guest = Guests.findOne({
      _id: FlowRouter.getParam("guestId")
    });

    if (typeof guest != 'undefined' && guest.freeHotelRoom == true) {
      return false;
    } else {
      return true;
    }
  },

  hasGuestMemberInfo() {
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    let familyId = guest.guestFamilyID;
    return Guests.find({
      guestFamilyID: familyId
    }).count() > 0;
  },

  hasFlightInfo() {
    var flightBooking = FlightBookings.find().count();
    return flightBooking ? true : false;
  },

  flightInfo() {
    var flightBookings = FlightBookings.find().map(booking => {
      var flight = {};
      if (booking.agencyProvided) {
        flight = Flights.findOne({
          _id: booking.flightId
        });
      }
      else {
        flight.flightLegs = booking.flightLegs;
      }
      return {
        flight,
        booking
      };
    });
    console.log('1211', flightBookings);
    return flightBookings;
  },

  hasFlightforsaleInfo() {
    var guestId = FlowRouter.getParam("guestId");
    var flightBooking = FlightforsaleBookings.find({ guestId: { $in: family_ids } }).fetch();
    return flightBooking ? true : false;
  },

  flightforsaleInfo() {
    var flightBookings = FlightforsaleBookings.find({ guestId: { $in: family_ids } }).map(booking => {
      var flight = {};
      flight = Flightsforsale.findOne({
        _id: booking.flightId
      });
      return {
        flight,
        booking
      };
    });

    return flightBookings;
  },

  hasGiftInfo() {
    var giftBooking = GiftBookings.findOne({
      guestId: FlowRouter.getParam("guestId")
    });

    return giftBooking ? true : false;
  },

  giftInfo() {
    var bookinggift = GiftBookings.findOne();
    var gift = Gifts.findOne({
      _id: bookinggift.giftId
    });
    return {
      gift, bookinggift
    };
  },

  hasDriverInfo() {
    var driverBooking = driverBookings.findOne({
      guestId: FlowRouter.getParam("guestId")
    });
    return driverBooking ? true : false;
  },

  driverInfo() {
    var bookingdriver = driverBookings.findOne();
    var driver = TransportDrivers.findOne({
      _id: bookingdriver.driverId
    });
    return {
      driver, bookingdriver
    };
  },

  hasFoodInfo() {
    var foodBooking = FoodBookings.findOne({
      guestId: FlowRouter.getParam("guestId")
    });
    return foodBooking ? true : false;
  },

  foodInfo() {
    var foodbooking = FoodBookings.findOne();
    var food = Foods.findOne({
      _id: foodbooking.foodId
    });

    return {
      food, foodbooking
    };
  },

  hasSizeInfo() {
    var sizeBooking = SizeBookings.findOne({
      guestId: FlowRouter.getParam("guestId")
    });

    return sizeBooking ? true : false;
  },

  sizeInfo() {
    var sizebooking = SizeBookings.findOne();
    var size = Sizes.findOne({
      _id: sizebooking.sizeId
    });
    return {
      size, sizebooking
    };
  },
  hasPassportInfo() {
    var passportBooking = PassportBookings.findOne({
      guestId: FlowRouter.getParam("guestId")
    });

    return passportBooking ? true : false;
  },

  passportInfo() {
    var bookingpassport = PassportBookings.findOne();
    var passport = PassportBookings.findOne({
      _id: bookingpassport.passportId
    });
    return {
      passport, bookingpassport
    };
  },

  hasVisaInfo() {
    var visaBooking = VisaBookings.findOne({
      guestId: FlowRouter.getParam("guestId")
    });

    return visaBooking ? true : false;
  },

  visaInfo() {
    var bookingvisa = VisaBookings.findOne();
    var visa = VisaBookings.findOne({
      _id: bookingvisa.visaId
    });

    return {
      visa, bookingvisa
    };
  },

  hasInsuranceInfo() {
    var insuranceBooking = InsuranceBookings.findOne({
      guestId: FlowRouter.getParam("guestId")
    });
    return insuranceBooking ? true : false;
  },

  insuranceInfo() {
    var bookinginsurance = InsuranceBookings.findOne();
    var insurance = InsuranceBookings.findOne({
      _id: bookinginsurance.insuranceId
    });
    return {
      insurance, bookinginsurance
    };
  },

  hasVehicleInfo() {
    var vehicleBooking = VehicleBookings.findOne({
      guestId: FlowRouter.getParam("guestId")
    });

    return vehicleBooking ? true : false;
  },

  vehicleInfo() {
    var bookingvehicle = VehicleBookings.findOne();
    var vehicle = TransportVehicles.findOne({
      _id: bookingvehicle.vehicleId
    });
    return {
      vehicle, bookingvehicle
    };
  },

  hasServicrInfo() {
    var serviceBooking = Services.findOne({
      guestId: FlowRouter.getParam("guestId")
    });
    return serviceBooking ? true : false;
  },

  serviceInfo() {
    var bookingservice = serviceBookings.findOne();
    var serv = Services.findOne({
      _id: bookingservice.serviceId
    });
    return {
      serv, bookingservice
    };
  },

  guestmemberInfo() {
    var guestMember = Guests.find({ guestMemberId: FlowRouter.getParam("guestId"), guestIsPrimary: false });
    return guestMember;
  },
  Ismember() {
    let x = Guests.findOne({
      _id: FlowRouter.getParam("guestId"),
    });
    return x.guestIsPrimary;
  }
});

Template.events_guest_profile_basic_info.helpers({
  guestEditPath() {
    let eventId = FlowRouter.getParam("id");
    let guestId = FlowRouter.getParam("guestId");
    return FlowRouter.path('events.guest.add', { id: eventId }, {
      guestId
    });
  },

  guestNotPrimary() {
    let { guest } = this;
    return guest ? !guest.guestIsPrimary : false;
  },

  primaryGuest() {
    let primary = Guests.findOne({ guestIsPrimary: true });

    if (primary) {
      let link = FlowRouter.path('events.guest.profile', {
        id: FlowRouter.getParam('id'),
        guestId: primary._id
      });
      return { ...primary, link };
    }
    return {};
  },

  photoId() {
    let { guest } = this;
    return guest && guest.photoID ? guest.photoID : "/img/guest_profile.jpg";
  },
  profileImage() {
    let { guest } = this;
    return guest && guest.photoID ? true : false;
  }
});

Template.agency_guest_member_add.onRendered(function () {
  this.$('.modal').modal();
  this.$('select').material_select();

  this.autorun(() => {
    let refresh = refreshSelect.get();
    Meteor.setTimeout(() => {
      var d = new Date();
      d.setFullYear(d.getFullYear() - 100);
      this.$('.datepicker').pickadate({
        selectMonths: true,
        selectYears: 80,
        max: new Date()
      });
      this.$('select').material_select();
      Materialize.updateTextFields();
    }, 100);
  });
});

Template.agency_guest_member_add.helpers({
  contactno() {
    let contacts = selectedContactN.get();
    return contacts;
  },
  airportiata() {
    var airportiataa = Airports.find();
    if (airportiataa.count() > 0) {
      $('select').material_select();
    }
    return airportiataa;
  },
  address1() {
    var valueadress1 = selectedAddress1.get();
    $('select').material_select();
    return valueadress1;
  },
  address2() {
    var valueadress2 = selectedAddress2.get();
    $('select').material_select();

    return valueadress2;
  },
  addresspin() {
    var valuepin = selectedPincode.get();
    $('select').material_select();

    return valuepin;
  },
  addresscity() {
    var valuecity = selectedcity.get();
    $('select').material_select();
    return valuecity;
  },
  addressland() {
    var valueland = selectedLandmark.get();
    $('select').material_select();
    return valueland;
  },
  addressstate() {
    var valuestate = selectedstate.get();
    $('select').material_select();

    return valuestate;
  },
  familyid() {
    var familyid = Guests.findOne({ _id: FlowRouter.getParam("guestId") });
    $('select').material_select();
    return familyid.guestFamilyID;
  },
});

Template.agency_guest_member_add.events({
  'submit #add-guest-member-form'(event, template) {
    event.preventDefault();
    var jq = template.$(event.target);
    var data = jq.serializeObject();
    data.guestMemberId = FlowRouter.getParam("guestId");
    data.guestFamilyID = this.guest.guestFamilyID;
    data.eventId = FlowRouter.getParam("id");
    insertGuestMembers.call(data, (err, res) => {
      if (err) {
        showError(err);
      }
      else {
        showSuccess("Faimly Member Assigned");
        template.$('.modal').modal('close');
      }
    });
  },
  'change #guestContactNo,paste #guestContactNo, keyup #guestContactNo, mouseup #guestContactNo'(event, template) {
    var comment_text = template.$(event.target).val();
    selectedContact.set(comment_text)
  },

  'change #primary-number-checkbox'(event, template) {
    let guest = Guests.findOne({ _id: FlowRouter.getParam("guestId") });
    let change = event.target.checked ? guest.guestContactNo : "";
    template.$('#guestContactNo').val(change);
    refreshUI();
  },

  'change #use-primary-email'(event, template) {
    let guest = Guests.findOne({ _id: FlowRouter.getParam("guestId") });
    let change = event.target.checked ? guest.guestPersonalEmail : "";
    template.$("#guestPersonalEmail").val(change);
    refreshUI();
  },

  'change #filled'(event, template) {
    // Also, no need for the pound sign here
    var comment_text = template.$(event.target).val();

    if (document.getElementById('filled').checked) {
      var x = selectedContact.get();
      selectedContactN.set(x);
      Session.set('key', true);
    }
    else {
      Session.set('key', false);
    }
    refreshUI();
  },
  'change #filled1'(event, template) {
    // Also, no need for the pound sign here
    var comment_text = template.$(event.target).val();

    if (document.getElementById('filled1').checked) {
      var add1 = Guests.findOne({ _id: FlowRouter.getParam("guestId") });
      selectedAddress1.set(add1.guestAddress1);
      var add2 = Guests.findOne({ _id: FlowRouter.getParam("guestId") });
      selectedAddress2.set(add2.guestAddress2);
      var pin = Guests.findOne({ _id: FlowRouter.getParam("guestId") });
      selectedcity.set(pin.guestAddressCity);
      var state = Guests.findOne({ _id: FlowRouter.getParam("guestId") });
      selectedstate.set(state.guestAddressState);
      var city = Guests.findOne({ _id: FlowRouter.getParam("guestId") });
      selectedPincode.set(city.guestAddressPincode);
      var land = Guests.findOne({ _id: FlowRouter.getParam("guestId") });
      selectedLandmark.set(land.guestAddressLandmark);
      Session.set('key', true);
    }
    else {
      Session.set('key', false);
    }
    refreshUI();
  }
});

Template.agency_guest_service_add.onRendered(function () {
  this.$('select').material_select();
});

Template.agency_guest_service_add.helpers({
  ServiceList() {
    var vehicle = Services.find();
    if (vehicle.count() > 0) {
      $('select').material_select();
    }
    return vehicle;
  },
});

Template.agency_guest_service_add.events({
  'submit #add-vehicle-form'(event, template) {
    event.preventDefault();
    var jq = template.$(event.target);
    var data = jq.serializeObject();
    data.guestId = FlowRouter.getParam("guestId");
    data.eventId = FlowRouter.getParam("id");

    bookServices.call(data, (err, res) => {
      if (err) {
        showError(err);
      }
      else {
        showSuccess("Vehicle Assigned");
      }
    });
  },
});

Template.events_guest_invite.onRendered(function () {
  this.$('select').material_select();
});

Template.events_guest_invite.events({
  'click .click_resend-invitation-button'(event, template) {
    event.preventDefault();
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    console.log('xxxxxxxxxxxxxxxxxxx',guest);
    sendGuestInvitation.call(guest, (err, res) => {
      if(err) {
	      showError(err.toString());
      }
      else {
	      showSuccess("Invitation Sent");
      }
    });
  }
})

function refreshUI() {
  refreshSelect.set(!refreshSelect.get());
}