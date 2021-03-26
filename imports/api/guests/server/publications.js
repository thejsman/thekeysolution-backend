import { Meteor } from "meteor/meteor";
import { Guests } from "../guests.js";
import { Events } from "../../events/events.js";
import { Flights } from "../../flights/flights.js";
import { FlightBookings } from "../../flights/flightBookings.js";
import { Airports } from "../../airports/airports.js";
import { Airlines } from "../../airlines/airlines.js";
import { Hotels } from "../../hotels/hotels.js";
import { HotelBookings } from "../../hotels/hotelBookings.js";
import { FoodPreferences } from "../../../api/preferences/foodpreference.js";
import { SizePreferences } from "../../../api/preferences/sizepreference.js";
import { SpecialAssistancePreferences } from "../../../api/preferences/specialassistancepreference.js";
import { RSVP } from "../../../api/rsvp/rsvp.js";
import { SubEvents } from "../../../api/subevents/subevents.js";
import { Gifts } from "../../../api/gifts/gifts.js";
import { GiftBookings } from "../../../api/gifts/giftBooking.js";
import { TransportDrivers } from "../../../api/transport/transport_drivers.js";
import { TransportVehicles } from "../../../api/transport/transport_vehicles.js";
import { TransportBookings } from "../../../api/transport/transportbookings.js";
import { Services } from "../../../api/services/services.js";
import { ServiceBookings } from "../../../api/services/serviceBooking.js";

import _ from "lodash";
import { guestsPerPage } from "../guestsPerPage.js";

Meteor.publish("guests.event", function (id, skip, searchTerm) {
  let skipCount = skip ? skip : 0;
  let searchObj = {
    eventId: id,
    guestIsPrimary: true,
  };

  if (searchTerm && searchTerm !== "") {
    let sT = `^.*(${searchTerm.split(" ").join("|")}).*$`;
    searchObj = {
      ...searchObj,
      $or: [
        {
          guestFirstName: new RegExp(sT, "i"),
        },
        {
          guestLastName: new RegExp(sT, "i"),
        },
        {
          guestContactNo: new RegExp(sT, "i"),
        },
        {
          guestPersonalEmail: new RegExp(sT, "i"),
        },
      ],
    };
  }
  return Guests.find(searchObj, {
    skip: skipCount,
    limit: guestsPerPage,
    sort: {
      guestFirstName: 1,
    },
  });
});

Meteor.publish("guests.guestInfo", function (guestId) {
  return Guests.find(guestId);
});

Meteor.publish("guests.all", function (eventId) {
  return Guests.find({ eventId: eventId });
});

Meteor.publish("event.flightBookings", function (eventId) {
  return FlightBookings.find({ eventId });
});

Meteor.publish("guests.pagination.with.sort", function (eventId, skipCount) {
  const skip = skipCount ? skipCount : 0;
  return Guests.find(
    { guestIsPrimary: true, eventId },
    { limit: guestsPerPage, skip }
  );
});

Meteor.publish("event.services.data", function (eventId) {
  return Services.find({ eventId });
});

Meteor.publish("guests.one", function (guestId, eventId) {
  var guests = Guests.find({
    _id: guestId,
  });

  if (guests.count() < 1) {
    return [];
  }

  var events = Events.find(eventId);

  var guest = Guests.findOne(guestId);
  let guestsFamily = Guests.find({
    guestFamilyID: guest.guestFamilyID,
    eventId,
  });

  let guestIds = guestsFamily.map((g) => g._id);

  var flightBookings = FlightBookings.find({
    eventId: eventId,
    guestId: guestId,
  });

  var flights = Flights.find({
    eventId: eventId,
  });

  var flightIds = [];
  flights.forEach((flight) => {
    var bookedSeats = FlightBookings.find({
      eventId: eventId,
      flightId: flight._id,
    });
    if (bookedSeats.count() < flight.flightTotalSeats) {
      flightIds.push(flight._id);
    }
  });

  flightBookings.forEach((booking) => {
    flightIds.push(booking.flightId);
  });

  var availableFlights = Flights.find({
    _id: {
      $in: flightIds,
    },
  });

  var airportIds = [];
  availableFlights.forEach((flight) => {
    _.each(flight.flightLegs, (leg) => {
      airportIds.push(leg.flightArrivalCityId);
      airportIds.push(leg.flightDepartureCityId);
    });
  });
  airportIds = _.uniq(airportIds);

  var airports = Airports.find({});

  let airlines = Airlines.find();

  var hotelBookings = HotelBookings.find({
    guestId: {
      $in: guestIds,
    },
  });

  var hotels = Hotels.find({
    eventId,
  });

  let serviceBookings = ServiceBookings.find({ guestId });

  let subevents = SubEvents.find({ eventId });
  let rsvps = RSVP.find({ guestId });

  let vehicles = TransportVehicles.find({ eventId });
  let drivers = TransportDrivers.find({ eventId });
  let transport = TransportBookings.find({ eventId, guestId });

  var foodPreferences = FoodPreferences.find({ eventId });
  var sizePreferences = SizePreferences.find({ eventId });
  var assistancePreferences = SpecialAssistancePreferences.find({ eventId });
  var giftList = Gifts.find({ eventId });
  var serviceList = Services.find({ eventId });

  var giftBookings = GiftBookings.find({ eventId, guestId });

  return [
    events,
    guestsFamily,
    availableFlights,
    airports,
    flightBookings,
    hotels,
    hotelBookings,
    foodPreferences,
    sizePreferences,
    giftList,
    giftBookings,
    vehicles,
    drivers,
    subevents,
    rsvps,
    assistancePreferences,
    transport,
    serviceList,
    serviceBookings,
    airlines,
  ];
});
