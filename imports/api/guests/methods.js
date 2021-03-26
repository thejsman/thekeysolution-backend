import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import {
  NewGuestSchema,
  GuestMemberSchema,
  GuestPassportSchema,
  GuestVisaSchema,
  GuestInsuranceSchema
} from "./schema.js";
import { Guests } from "./guests.js";
import { Events } from "../events/events.js";
import { IncrementGuestCount } from "./guestUtils.js";
import { Roles } from "meteor/meteor-roles";
import { RSVP } from "../rsvp/rsvp.js";
import { Rooms } from "../hotels/rooms.js";
import { Rooms as RoomsForSale } from "../hotelsforsale/roomsforsale.js";
import { Hotelsforsale } from "../hotelsforsale/hotelsforsale.js";
import { Hotels } from "../hotels/hotels.js";
import { HotelBookings } from "../hotels/hotelBookings.js";
import { FlightBookings } from "../flights/flightBookings.js";
import { Flights } from "../flights/flights.js";
import { Flightsforsale } from "../flightsforsale/flightsforsale.js";
import { FlightforsaleBookings } from "../flightsforsale/flightforsaleBookings.js";
import { SubEvents } from "../subevents/subevents.js";
import { insertActivity } from "../../api/activity_record/methods.js";
import { Airports } from "../airports/airports.js";
import { FoodPreferences } from "../preferences/foodpreference.js";
import { SizePreferences } from "../preferences/sizepreference.js";
import { SpecialAssistancePreferences } from "../preferences/specialassistancepreference.js";
import { Services, ServiceSlots } from "../services/services.js";
import { ServiceBookings } from "../services/serviceBooking"
import moment from "moment";

import _ from "lodash";
import { CodeStar } from "aws-sdk";

let isAllowed = (userId, role) => {
  let scopes = Roles.getScopesForUser(userId);
  if (scopes.length > 0) {
    for (var i = 0; i < scopes.length; i++) {
      if (Roles.userIsInRole(userId, role, scopes[i])) {
        return true;
      }
    }
    return false;
  }
  return Roles.userIsInRole(userId, role);
};

//code to insert data in Activity Record
function activityRecordInsert(data) {
  var activityEvent = "";
  var activityEventId = "";
  var activityUserInfo = {};
  if (!Meteor.userId()) {
    activityUserInfo = {
      id: "123456798",
      name: "API Call",
      email: "api@call.com"
    };
  } else {
    activityUserInfo = {
      id: Meteor.userId(),
      name: Meteor.user().profile.name,
      email: Meteor.user().emails[0].address
    };
  }
  if (data.eventId == null || data.eventId == "" || data.eventId == undefined) {
    activityEvent = "general";
    activityEventId = "general";
  } else {
    var event = Events.findOne(data.eventId);
    activityEvent = event.basicDetails.eventName;
    activityEventId = event._id;
  }
  var date = new Date();
  userdata = {
    activityeDateTime: date,
    activityUserInfo: activityUserInfo,
    activityModule: data.activityModule,
    activitySubModule: data.activitySubModule,
    activityEvent: activityEvent,
    activityEventId: activityEventId,
    activityMessage: data.activityMessage
  };
  insertActivity.call(userdata, (err, res) => {
    if (err) {
      // console.log("returning false");
      return 0;
    } else {
      // console.log("returning true");
      return true;
    }
  });
}

export const getFilesListForGuest = new ValidatedMethod({
  name: "Guests.methods.getDownloadList",
  validate: null,
  run(guestId) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, "guest-download")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    let guest = Guests.findOne(guestId);
    if (!guest) throw new Meteor.Error("Guest not found");
    let family = Guests.find({ guestFamilyID: guest.guestFamilyID });
    let urls = family.map(fam => {
      return {
        _id: fam._id,
        name: fam.guestFirstName + " " + fam.guestLastName,
        urls: {
          guestPassportImages: fam.guestPassportImages,
          guestVisaImages: fam.guestVisaImages,
          guestInsuranceImages: fam.guestInsuranceImages,
          guestArrivalTickets: fam.TicketsArrival,
          guestDepartureTickets: fam.TicketsDeparture,
          photoID: fam.photoID
        }
      };
    });
    return urls;
  }
});

export const uploadGuestExcel = new ValidatedMethod({
  name: "Guests.methods.uploadExcel",
  validate: null,
  run(file) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, "guest-import")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    if (Meteor.isServer) {
      let wb = require("./server/processExcel.js").updateGuestsFromExcel(
        file.data,
        file.name,
        file.eventId,
        file.invitelist
      );
      return wb;
      // process(file.data, file.name, file.eventId);
    }
  }
});

export const downloadGuestExcel = new ValidatedMethod({
  name: "Guests.methods.downloadExcel",
  validate: null,
  run({ eventId, extraInfo }) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, "guest-export")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    if (Meteor.isServer) {
      let wb = require("./server/processExcel.js").getGuestsExcel(
        eventId,
        extraInfo
      );
      return wb;
    }
    return null;
  }
});

export const downloadGuestSampleExcel = new ValidatedMethod({
  name: "Guests.methods.downloadSampleExcel",
  validate: null,
  run() {
    // ABL_SAM added Permission Check
    if (Meteor.isServer) {
      let wb = require("./server/processExcel.js").getGuestsSampleExcel();
      return wb;
    }
    return null;
  }
});

export const insertGuest = new ValidatedMethod({
  name: "Guests.methods.insert",
  validate: NewGuestSchema.validator({ clean: true }),
  run(newGuest) {
    // ABL_SAM added Permission Check
    // if (!isAllowed(this.userId, 'guest-add')) {
    //   throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    // }
    var event = Events.findOne({
      _id: newGuest.eventId
    });

    if (event) {
      let alreadyExists = Guests.findOne({
        guestPersonalEmail: newGuest.guestPersonalEmail,
        eventId: newGuest.eventId
      });

      if (alreadyExists) {
        throw new Meteor.Error("Guest with same email already exists");
      }

      let alreadyFamilyID = Guests.findOne({
        guestFamilyID: newGuest.guestFamilyID,
        guestIsPrimary: true,
        eventId: newGuest.eventId
      });

      if (alreadyFamilyID) {
        throw new Meteor.Error(
          "Primary guest with same family ID already exists"
        );
      }

      var count = IncrementGuestCount(newGuest.eventId);
      newGuest.accessCode = Math.floor(1000 + Math.random() * 9000).toString();
      newGuest.folioNumber = count;

      let subevents = SubEvents.find({ eventId: newGuest.eventId }).fetch();
      let seList = [];
      seList = subevents.map(a => {
        return {
          subEventId: a._id,
          status: true
        };
      });
      newGuest.inviteStatus = seList;
      var insertResponse = false;
      Guests.insert(newGuest, (err, res) => {
        if (err) {
          return false;
        } else {
          insertResponse = true;
        }
      });

      //code to insert data in Activity Record
      activityInsertData = {
        eventId: newGuest.eventId,
        activityModule: "Guests",
        activitySubModule: "Profile",
        event: "add",
        activityMessage:
          "Profile of guest " +
          newGuest.guestTitle +
          " " +
          newGuest.guestFirstName +
          " " +
          newGuest.guestLastName +
          " is added."
      };
      activityRecordInsert(activityInsertData);
      return insertResponse;
    } else {
      throw new Meteor.Error("Event id invalid");
    }
  }
});

export const insertGuestMembers = new ValidatedMethod({
  name: "GuestsMembers.methods.insert",
  validate: GuestMemberSchema.validator({ clean: true }),
  run(newGuest) {
    var event = Events.findOne({
      _id: newGuest.eventId
    });

    if (event) {
      let alreadyExists = Guests.findOne({
        guestPersonalEmail: newGuest.guestPersonalEmail,
        eventId: newGuest.eventId
      });
      var count = IncrementGuestCount(newGuest.eventId);
      if (alreadyExists) {
        let em = newGuest.guestPersonalEmail.split("@");
        let f = Array(5 - String(count).length + 1).join("0") + count;
        newGuest.guestPersonalEmail = em[0] + "+family" + f + "@" + em[1];
        newGuest.count = count;
      }
      newGuest.accessCode = Math.floor(1000 + Math.random() * 9000).toString();
      newGuest.folioNumber = count;
      let subevents = SubEvents.find({ eventId: newGuest.eventId }).fetch();
      let seList = [];
      seList = subevents.map(a => {
        return {
          subEventId: a._id,
          status: true
        };
      });
      newGuest.inviteStatus = seList;
      Guests.insert(newGuest);

      //code to insert data in Activity Record
      activityInsertData = {
        eventId: newGuest.eventId,
        activityModule: "Guests",
        activitySubModule: "Profile",
        event: "add",
        activityMessage:
          "Profile of guest member " +
          newGuest.guestTitle +
          " " +
          newGuest.guestFirstName +
          " " +
          newGuest.guestLastName +
          " is added."
      };
      activityRecordInsert(activityInsertData);
    } else {
      throw new Meteor.Error("Event id invalid");
    }
  }
});

export const getTotalGuestCount = new ValidatedMethod({
  name: "Guest.methods.guestCount",
  validate: null,
  run(eventId) {
    let total = Guests.find({ eventId }).count();
    let primary = Guests.find({ eventId, guestIsPrimary: true }).count();
    let loggedin = Guests.find({
      $and: [
        { eventId },
        { guestIsPrimary: true },
        { appLoginTime: { $exists: true } },
        { appLoginTime: { $ne: "" } }
      ]
    }).count();
    return { total, primary, loggedin };
  }
});

export const getFamilyMemberCount = new ValidatedMethod({
  name: "Guest.methods.familyCount",
  validate: null,
  run(guestId) {
    let guest = Guests.findOne(guestId);
    let family = Guests.find({
      eventId: guest.eventId,
      guestFamilyID: guest.guestFamilyID,
      guestIsPrimary: false
    }).fetch();
    return family;
  }
});

//Food Preferences Report - START
export const getMealSummary = new ValidatedMethod({
  name: "Guest.methods.mealSummary",
  validate: null,
  run: eventId => {
    let summary = [];
    const mealSummary = Guests.find(
      { eventId, foodPreference: { $ne: null } },
      { fields: { foodPreference: 1 } }
    ).fetch();
    const groupedSummary = _.groupBy(mealSummary, "foodPreference", length);
    for (const key in groupedSummary)
      summary.push({ type: key, value: groupedSummary[key].length });
    return { summary };
  }
});

//Food Preferences Report - END

// Reports V2.0 start
export const getGuestBySortData = new ValidatedMethod({
  name: "Guest.methods.sort",
  validate: null,
  run({ eventId, skip = 0, sortField, direction, limit, allRecords }) {
    if (sortField) {
      let options = {
        sort: { [sortField]: direction == "-1" ? 1 : -1 }
      };
      if (!allRecords) {
        options = { ...options, limit, skip };
      }
      return Guests.find({ guestIsPrimary: true, eventId }, options).fetch();
    }
    return Guests.find(
      { guestIsPrimary: true, eventId },
      { sort: { appLoginTime: -1 }, limit, skip }
    ).fetch();
  }
});

// Report V3.0 Service Info Start
export const getTotalGuestWithServiceInfo = new ValidatedMethod({
  name: "Guest.methods.totalguest_service_info",
  validate: null,
  run({ eventId, skip = 0, sortField, direction, limit, allRecords }) {
    let guest;
    const services = Services.find({eventId}).fetch();
    
    serviceBooked = ServiceBookings.find({serviceId: {$in:_.map(services,"_id")}}).fetch();
    const guestIds = _.map(serviceBooked, "guestId")
   

    if (sortField) {
      let options = {
        sort: { [sortField]: direction == "-1" ? 1 : -1 }
      };
      if (!allRecords) {
        options = { ...options, limit, skip };
      }
      guest =  Guests.find({ eventId, _id: {$in:guestIds} }, options).fetch();
    } else {
      guest =  Guests.find({ eventId, _id: {$in:guestIds} }, { limit, skip }).fetch();
    }
    guest.forEach(g => {
      const serviceInfo = ServiceBookings.find(
        { guestId: g._id },
        { fields: { serviceId: 1, serviceDate: 1, serviceTime: 1 } }
      ).fetch();
      
      g.serviceData = serviceInfo.reduce((acc, r) => {
        acc[r.serviceId] = r.serviceDate + " " + r.serviceTime;
        return acc;
      }, {});
    });
    
    return guest;
  }
});
// Report V3.0 Service Info End

export const getGuestBySortDataHotels = new ValidatedMethod({
  name: "Guest.methods.hotels",
  validate: null,
  run({ eventId, skip = 0, sortField, direction, limit, allRecords }) {
    if (sortField) {
      let options = {
        sort: { [sortField]: direction == "-1" ? 1 : -1 }
      };
      if (!allRecords) {
        options = { ...options, limit, skip };
      }
      return getGuestsWithHotel(eventId, options);
    }

    return getGuestsWithHotel(eventId);
  }
});
const getGuestsWithHotel = (eventId, options) => {
  const hotelBookings = HotelBookings.find({
    eventId,
    guestId: { $ne: null }
  }).fetch();
  const hotelIds = _.uniq(_.map(hotelBookings, "hotelId"));
  const guestIdsWithHotels = _.uniq(_.map(hotelBookings, "guestId"));

  const guests = Guests.find(
    { eventId, _id: { $in: guestIdsWithHotels } },
    options
  ).fetch();

  const hotels = Hotels.find({ eventId, _id: { $in: hotelIds } }).fetch();
  const rooms = Rooms.find({ eventId, hotelId: { $in: hotelIds } }).fetch();
  guests.map(g => (g.hotelBookings = []));

  guests.map(g => {
    hotelBookings.forEach(booking => {
      if (booking.guestId === g._id) {
        const hBooking = {
          hotelName: hotels.filter(h => h._id === booking.hotelId)[0].hotelName,
          roomCategory: rooms.filter(r => r._id === booking.roomId)[0]
            .hotelRoomCategory,
          bedType: rooms.filter(r => r._id === booking.roomId)[0]
            .hotelRoomBedType,
          checkInDate: moment(
            new Date(booking.hotelRoomFrom).toISOString()
          ).format("DD-MM-YYYY"),
          checkOutDate: moment(
            new Date(booking.hotelRoomTo).toISOString()
          ).format("DD-MM-YYYY"),
          placeHolderRoomNo: booking.placeHolderRoomNumber,
          displayRoom: booking.roomNumber
        };
        g.hotelBookings.push(hBooking);
      }
    });
  });
  return guests;
};

export const getGuestBySortDataWithFlightsArrival = new ValidatedMethod({
  name: "Guest.methods.flight.arrival",
  validate: null,
  run({
    start_date,
    end_date,
    eventId,
    skip = 0,
    sortField,
    direction,
    limit,
    allRecords
  }) {
    const fromDate = new Date(start_date).toISOString().replace("Z", "");
    const toDate = new Date(end_date).toISOString().replace("Z", "");

    const flightData = FlightBookings.find({
      eventId,
      "flightLegs.flightArrivalTime": { $gte: fromDate, $lte: toDate }
    }).fetch();
    const airports = Airports.find().fetch();

    flightData.forEach(f => {
      if (f.agencyProvided === true) {
        const flightId = f.flightId;
        const aFlight = Flights.find({
          _id:flightId
         
        }).fetch();
       
        if (aFlight) {
          const leg = _.map(aFlight, "flightLegs");
          Object.assign(f, { flightLegs: leg[0] });
        }
      }
    });

    _.forEach(flightData, f => {
      _.forEach(f.flightLegs, l => {
        const arrivalCity = _.map(
          airports.filter(a => a._id === l.flightArrivalCityId),
          "airportIATA"
        ).toString();
        const departureCity = _.map(
          airports.filter(a => a._id === l.flightDepartureCityId),
          "airportIATA"
        ).toString();

        Object.assign(l, { arrivalCity, departureCity });
      });
    });

    const guestIdsWithFlightData = _.uniq(_.map(flightData, "guestId"));

    let guestData = Guests.find(
      { eventId, _id: { $in: guestIdsWithFlightData } },
      { limit, skip }
    ).fetch();

    guestData.forEach(g => {
      Object.assign(g, {
        flights: flightData.filter(f => f.guestId === g._id)
      });
    });
    if (sortField) {
      limit = 50;
      let options = {
        sort: { [sortField]: direction == "asc" ? "desc" : "asc" }
      };
      if (!allRecords) {
        options = { ...options, limit, skip };
      }
      const guestObject = _.sortBy(guestData, sortField, direction);
      return guestObject;
    }

    return guestData;
  }
});

export const getGuestBySortDataWithFlightsDeparture = new ValidatedMethod({
  name: "Guest.methods.flight.departure",
  validate: null,
  run({
    start_date,
    end_date,
    eventId,
    skip = 0,
    sortField,
    direction,
    limit,
    allRecords
  }) {
    const fromDate = new Date(start_date).toISOString().replace("Z", "");
    const toDate = new Date(end_date).toISOString().replace("Z", "");

    const flightData = FlightBookings.find({
      eventId,
      "flightLegs.flightDepartureTime": { $gte: fromDate, $lte: toDate }
    }).fetch();
    const airports = Airports.find().fetch();

    flightData.forEach(f => {
      if (f.agencyProvided === true) {
        const flightId = f.flightId;
        const aFlight = Flights.find({
          _id:flightId
         
        }).fetch();
       
        if (aFlight) {
          const leg = _.map(aFlight, "flightLegs");
          Object.assign(f, { flightLegs: leg[0] });
        }
      }
    });

    _.forEach(flightData, f => {
      _.forEach(f.flightLegs, l => {
        const arrivalCity = _.map(
          airports.filter(a => a._id === l.flightArrivalCityId),
          "airportIATA"
        ).toString();
        const departureCity = _.map(
          airports.filter(a => a._id === l.flightDepartureCityId),
          "airportIATA"
        ).toString();

        Object.assign(l, { arrivalCity, departureCity });
      });
    });

    const guestIdsWithFlightData = _.uniq(_.map(flightData, "guestId"));

    let guestData = Guests.find(
      { eventId, _id: { $in: guestIdsWithFlightData } },
      { limit, skip }
    ).fetch();

    guestData.forEach(g => {
      Object.assign(g, {
        flights: flightData.filter(f => f.guestId === g._id)
      });
    });
    if (sortField) {
      limit = 50;
      let options = {
        sort: { [sortField]: direction == "asc" ? "desc" : "asc" }
      };
      if (!allRecords) {
        options = { ...options, limit, skip };
      }
      const guestObject = _.sortBy(guestData, sortField, direction);
      return guestObject;
    }

    return guestData;
  }
});

// export const getGuestBySortDataWithFlightsDeparture = new ValidatedMethod({
//   name: "Guest.methods.flight.departure",
//   validate: null,
//   run(departureInfo) {
//     const { start_date, end_date, eventId } = departureInfo;
//     let data = Guests.find({ eventId }).fetch();
//     const flightData = FlightBookings.find({ eventId }).fetch();
//     const uniqGuestIds = _.uniq(_.map(flightData, "guestId"));
//     guestData = data.filter(guest => uniqGuestIds.indexOf(guest._id) > -1);

//     guestData.map(g => (g.flights = []));
//     guestDataWithFlight = guestWithFlightsDeparture(
//       flightData,
//       guestData,
//       start_date,
//       end_date
//     );

//     // if (sortField) {
//     //   let options = {
//     //     sort: { [sortField]: direction == "asc" ? "desc" : "asc" }
//     //   };
//     //   if (!allRecords) {
//     //     options = { ...options, limit, skip };
//     //   }
//     //   const guestObject = _.sortBy(guestDataWithFlight, sortField, direction);
//     //   return guestObject;
//     // }

//     return guestDataWithFlight;
//   }
// });

export const getGuestBySortDataWithFlights = new ValidatedMethod({
  name: "Guest.methods.flight.sort",
  validate: null,
  run({ eventId, skip = 0, sortField, direction, limit, allRecords }) {
    const flightData = FlightBookings.find({ eventId }).fetch();
    const airports = Airports.find().fetch();

    flightData.forEach(f => {
      if (f.agencyProvided === true) {
        const aFlight = Flights.find(f.flightId).fetch();
        const leg = _.map(aFlight, "flightLegs");
        Object.assign(f, { flightLegs: leg[0] });
      }
    });

    _.forEach(flightData, f => {
      _.forEach(f.flightLegs, l => {
        const arrivalCity = _.map(
          airports.filter(a => a._id === l.flightArrivalCityId),
          "airportIATA"
        ).toString();
        const departureCity = _.map(
          airports.filter(a => a._id === l.flightDepartureCityId),
          "airportIATA"
        ).toString();

        Object.assign(l, { arrivalCity, departureCity });
      });
    });

    const guestIdsWithFlightData = _.uniq(_.map(flightData, "guestId"));

    let guestData = Guests.find(
      { eventId, _id: { $in: guestIdsWithFlightData } },
      { limit, skip }
    ).fetch();

    guestData.forEach(g => {
      Object.assign(g, {
        flights: flightData.filter(f => f.guestId === g._id)
      });
    });

    if (sortField) {
      let options = {
        sort: { [sortField]: direction == "asc" ? "desc" : "asc" }
      };
      if (!allRecords) {
        options = { ...options, limit, skip };
      }
      const guestObject = _.sortBy(guestData, sortField, direction);
      return guestObject;
    }

    return guestData;
  }
});

export const getLegsMax = new ValidatedMethod({
  name: "Guest.methods.maxLegs",
  validate: null,
  run(eventId) {
    const flightsBookings = FlightBookings.find({ eventId }).fetch();
    let max = 1;
    const newF = flightsBookings.map(flight => flight.guestId);
    let counts = {};
    newF.forEach(function(x) {
      counts[x] = (counts[x] || 0) + 1;
    });
    let arr = Object.values(counts);
    if (arr) return Math.max(...arr);
  }
});

const guestWithFlightsArrival = (
  flightData,
  guestData,
  start_date,
  end_date
) => {
  const now = new Date();
  const fromDate = new Date(start_date).toISOString();
  const toDate = new Date(end_date).toISOString();

  let filteredGuests = {};
  flightData.forEach(flight => {
    guestData.filter(guest => {
      guest._id === flight.guestId &&
      flight.flightLegs[0].flightArrivalTime >= fromDate.replace("Z", "") &&
      flight.flightLegs[0].flightArrivalTime <= toDate.replace("Z", "")
        ? guest.flights.push(flight)
        : null;
    });
  });

  filteredGuests = guestData.filter(g => g.flights.length > 0);
  return filteredGuests;
};

const guestWithFlightsDeparture = (
  flightData,
  guestData,
  start_date,
  end_date
) => {
  const now = new Date();
  const fromDate = new Date(start_date).toISOString();
  const toDate = new Date(end_date).toISOString();

  let filteredGuests = {};
  flightData.forEach(flight => {
    guestData.filter(guest => {
      guest._id === flight.guestId &&
      flight.flightLegs[0].flightDepartureTime >= fromDate.replace("Z", "") &&
      flight.flightLegs[0].flightDepartureTime <= toDate.replace("Z", "")
        ? guest.flights.push(flight)
        : null;
    });
  });

  filteredGuests = guestData.filter(g => g.flights.length > 0);
  return filteredGuests;
};

export const getFlightBookings = new ValidatedMethod({
  name: "Guest.methods.flightBookings",
  validate: null,
  run(eventId) {
    const flightsBookings = FlightBookings.find({ eventId }).fetch();
    return flightsBookings;
  }
});

export const getTotalGuestBySortData = new ValidatedMethod({
  name: "Guest.methods.totalsort",
  validate: null,
  run({ eventId, skip = 0, sortField, direction, limit, allRecords }) {
    if (sortField) {
      let options = {
        sort: { [sortField]: direction == "-1" ? 1 : -1 }
      };
      if (!allRecords) {
        options = { ...options, limit, skip };
      }
      return Guests.find({ eventId }, options).fetch();
    }
    return Guests.find({ eventId }, { limit, skip }).fetch();
  }
});

//Meal Preference Report V2.0
export const getTotalGuestBySortDataMeal = new ValidatedMethod({
  name: "Guest.methods.meal",
  validate: null,
  run({ eventId, skip = 0, sortField, direction, limit, allRecords }) {
    if (sortField) {
      let options = {
        sort: { [sortField]: direction == "-1" ? 1 : -1 }
      };
      if (!allRecords) {
        options = { ...options, limit, skip };
      }
      return Guests.find(
        { eventId, foodPreference: { $ne: null } },
        options
      ).fetch();
    }
    return Guests.find(
      { eventId, foodPreference: { $exists: true } },
      { sort: { foodPreference: 1 }, limit, skip }
    ).fetch();
  }
});

//Specail Assistance Report V2.0
export const getTotalGuestBySortDataAssistance = new ValidatedMethod({
  name: "Guest.methods.assistance",
  validate: null,
  run({ eventId, skip = 0, sortField, direction, limit, allRecords }) {
    if (sortField) {
      let options = {
        sort: { [sortField]: direction == "-1" ? 1 : -1 }
      };
      if (!allRecords) {
        options = { ...options, limit, skip };
      }
      return Guests.find(
        { eventId, specialAssistance: { $exists: true, $not: { $size: 0 } } },
        options
      ).fetch();
    }
    return Guests.find(
      { eventId, specialAssistance: { $exists: true, $not: { $size: 0 } } },
      { sort: { specialAssistance: 1 }, limit, skip }
    ).fetch();
  }
});

// Merchandise size Report V2.0
export const getTotalGuestBySortDataMerchandise = new ValidatedMethod({
  name: "Guest.methods.Merchandise",
  validate: null,
  run({ eventId, skip = 0, sortField, direction, limit, allRecords }) {
    if (sortField) {
      let options = {
        sort: { [sortField]: direction == "-1" ? 1 : -1 }
      };
      if (!allRecords) {
        options = { ...options, limit, skip };
      }
      return Guests.find(
        { eventId, sizePreference: { $exists: true } },
        options
      ).fetch();
    }
    return Guests.find(
      { eventId, sizePreference: { $exists: true } },
      { sort: { sizePreference: 1 }, limit, skip }
    ).fetch();
  }
});

export const updateGuests = new ValidatedMethod({
  name: "Guests.methods.update",
  validate: NewGuestSchema.validator({ clean: true }),
  run(guestUpdate) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, "guest-edit")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    if (isAllowed(this.userId, "guests-list")) {
      let guest = Guests.findOne(guestUpdate.guestId);
      if (!guest) {
        throw new Meteor.Error("Guest not found");
      }

      guestUpdate.guestIsPrimary = guest.guestIsPrimary;
      guestUpdate.guestInviteSent = guest.guestInviteSent;

      Guests.update(guestUpdate.guestId, {
        $set: guestUpdate
      });

      //code to insert data in Activity Record
      activityInsertData = {
        eventId: guestUpdate.eventId,
        activityModule: "Guests",
        activitySubModule: "Profile",
        event: "update",
        activityMessage:
          "Profile of guest member " +
          guestUpdate.guestTitle +
          " " +
          guestUpdate.guestFirstName +
          " " +
          guestUpdate.guestLastName +
          " is updated."
      };
      activityRecordInsert(activityInsertData);
    } else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

export const updateGuestPassport = new ValidatedMethod({
  name: "Guests.methods.update.passport",
  validate: GuestPassportSchema.validator(),
  run(passport) {
    Guests.update(passport.guestId, {
      $set: {
        passportInfo: passport
      }
    });

    //code to insert data in Activity Record
    let guests = Guests.findOne(passport.guestId);
    activityInsertData = {
      eventId: guests.eventId,
      activityModule: "Guests",
      activitySubModule: "Passport",
      event: "update",
      activityMessage:
        "Passport of guest member " +
        guests.guestTitle +
        " " +
        guests.guestFirstName +
        " " +
        guests.guestLastName +
        " is updated."
    };
    activityRecordInsert(activityInsertData);
  }
});

export const updateGuestVisa = new ValidatedMethod({
  name: "Guests.methods.update.visa",
  validate: GuestVisaSchema.validator(),
  run(visa) {
    Guests.update(visa.guestId, {
      $set: {
        visaInformation: visa
      }
    });

    //code to insert data in Activity Record
    let guests = Guests.findOne(visa.guestId);
    activityInsertData = {
      eventId: guests.eventId,
      activityModule: "Guests",
      activitySubModule: "Visa",
      event: "update",
      activityMessage:
        "Visa of guest member " +
        guests.guestTitle +
        " " +
        guests.guestFirstName +
        " " +
        guests.guestLastName +
        " is updated."
    };
    activityRecordInsert(activityInsertData);
  }
});

export const updateGuestInsurance = new ValidatedMethod({
  name: "Guests.methods.update.insurance",
  validate: GuestInsuranceSchema.validator(),
  run(insurance) {
    Guests.update(insurance.guestId, {
      $set: {
        insuranceInfo: insurance
      }
    });

    //code to insert data in Activity Record
    let guests = Guests.findOne(insurance.guestId);
    activityInsertData = {
      eventId: guests.eventId,
      activityModule: "Guests",
      activitySubModule: "Insurance",
      event: "update",
      activityMessage:
        "Insurance of guest member " +
        guests.guestTitle +
        " " +
        guests.guestFirstName +
        " " +
        guests.guestLastName +
        " is updated."
    };
    activityRecordInsert(activityInsertData);
  }
});

export const deleteGuests = new ValidatedMethod({
  name: "Guests.methods.delete",
  validate: null,
  run(guestId) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, "guest-delete")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    if (isAllowed(this.userId, "guests-list")) {
      let guests = Guests.findOne(guestId); //data fetched to be inserted in activity record later.
      Guests.remove(guestId);
      HotelBookings.remove({ guestId });
      FlightBookings.remove({ guestId });

      //code to insert data in Activity Record
      activityInsertData = {
        eventId: guests.eventId,
        activityModule: "Guests",
        activitySubModule: "Profile",
        event: "delete",
        activityMessage:
          "Profile of guest member " +
          guests.guestTitle +
          " " +
          guests.guestFirstName +
          " " +
          guests.guestLastName +
          " is deleted."
      };
      activityRecordInsert(activityInsertData);
    } else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

// RSVP Data for Summary
export const getRSVPSummary = new ValidatedMethod({
  name: "rsvpSummary",
  validate: null,
  run(eventId) {
    const event = Events.findOne({ _id: eventId });
    if (!(event && event.basicDetails)) {
      return [];
    }
    const { eventSubeventSorting, eventDestination } = event.basicDetails;

    const isGTDestination = eventSubeventSorting === "destination";
    const isGTDate = eventSubeventSorting === "date";
    const isGTSubEvent = eventSubeventSorting === "subevent";
    const result = [];
    if (isGTDestination) {
      const subEvents = SubEvents.find({
        eventId,
        subEventDestination: { $in: eventDestination }
      });
      const guestIds = [];
      subEvents.map(subEvent => {
        const { _id: subEventId, subEventDestination } = subEvent;
        const guestCount = Guests.find({
          inviteStatus: {
            subEventId,
            status: true
          }
        }).count();
        const rsvp = RSVP.find({ eventId, subEventId });
        if (!rsvp.count()) {
          const destinationIndex = result.findIndex(
            rItem => rItem.destination === subEventDestination
          );
          const isDestinationExist = destinationIndex !== -1;
          if (!isDestinationExist) {
            result.push({
              destination: subEventDestination,
              rsvpYes: 0,
              rsvpNo: 0,
              rsvpNotResponded: guestCount
            });
          }
        }

        rsvp.forEach(item => {
          const { guestId, status } = item;
          const guestIdwithEvent = guestId.concat(subEventDestination);
          const destinationIndex = result.findIndex(
            rItem => rItem.destination === subEventDestination
          );
          const isDestinationExist = destinationIndex !== -1;
          if (!isDestinationExist) {
            guestIds.push(guestIdwithEvent);
            if (status === true) {
              result.push({
                destination: subEventDestination,
                rsvpYes: 1,
                rsvpNo: 0,
                rsvpNotResponded: 0
              });
            } else if (status === false) {
              result.push({
                destination: subEventDestination,
                rsvpYes: 0,
                rsvpNo: 1,
                rsvpNotResponded: 0
              });
            } else {
              result.push({
                destination: subEventDestination,
                rsvpYes: 0,
                rsvpNo: 0,
                rsvpNotResponded: 1
              });
            }
          } else {
            const guestIndex = guestIds.findIndex(
              guest => guest === guestIdwithEvent
            );
            const isGuestExist = guestIndex !== -1;
            if (!isGuestExist) {
              guestIds.push(guestIdwithEvent);
              if (status === true) {
                result[destinationIndex].rsvpYes += 1;
              } else if (status === false) {
                result[destinationIndex].rsvpNo += 1;
              } else {
                return;
              }
            } else {
              return;
            }
          }
        });
        result.map(item => {
          if (item.destination === subEventDestination) {
            item.rsvpNotResponded = Math.max(
              0,
              guestCount - (item.rsvpYes + item.rsvpNo)
            );
          }
        });
      });
    } else if (isGTDate) {
      const subEvents = SubEvents.find({ eventId });
      const guestIds = [];
      subEvents.map(subEvent => {
        const { _id: subEventId, subEventDate } = subEvent;
        const guestCount = Guests.find({
          inviteStatus: {
            subEventId,
            status: true
          }
        }).count();
        const rsvp = RSVP.find({ eventId, subEventId });
        if (!rsvp.count()) {
          const dateIndex = result.findIndex(
            rItem => rItem.date === subEventDate
          );
          const isDateExist = dateIndex !== -1;
          if (!isDateExist) {
            result.push({
              date: subEventDate,
              rsvpYes: 0,
              rsvpNo: 0,
              rsvpNotResponded: guestCount
            });
          }
        }
        rsvp.forEach(item => {
          const { guestId, status } = item;
          const guestIdwithEvent = guestId.concat(subEventDate);
          const dateIndex = result.findIndex(
            rItem => rItem.date === subEventDate
          );
          const isDateExist = dateIndex !== -1;
          if (!isDateExist) {
            guestIds.push(guestIdwithEvent);
            if (status === true) {
              result.push({
                date: subEventDate,
                rsvpYes: 1,
                rsvpNo: 0,
                rsvpNotResponded: 0
              });
            } else if (status === false) {
              result.push({
                date: subEventDate,
                rsvpYes: 0,
                rsvpNo: 1,
                rsvpNotResponded: 0
              });
            } else {
              result.push({
                date: subEventDate,
                rsvpYes: 0,
                rsvpNo: 0,
                rsvpNotResponded: 1
              });
            }
          } else {
            const guestIndex = guestIds.findIndex(
              guest => guest === guestIdwithEvent
            );
            const isGuestExist = guestIndex !== -1;
            if (!isGuestExist) {
              guestIds.push(guestIdwithEvent);
              if (status === true) {
                result[dateIndex].rsvpYes += 1;
              } else if (status === false) {
                result[dateIndex].rsvpNo += 1;
              } else {
                return;
              }
            }
          }
        });
        result.map(item => {
          if (item.date === subEventDate) {
            item.rsvpNotResponded = Math.max(
              0,
              guestCount - (item.rsvpYes + item.rsvpNo)
            );
          }
        });
      });
    } else if (isGTSubEvent) {
      const subEvents = SubEvents.find({ eventId });
      subEvents.map(subEvent => {
        const { _id: subEventId, subEventTitle } = subEvent;
        const guestCount = Guests.find({
          inviteStatus: {
            subEventId,
            status: true
          }
        }).count();
        const rsvp = RSVP.find({ eventId, subEventId });
        let rsvpYes = 0;
        let rsvpNo = 0;
        let rsvpNotResponded = 0;
        rsvp.forEach(item => {
          const { status } = item;
          if (status === true) {
            rsvpYes += 1;
          } else if (status === false) {
            rsvpNo += 1;
          } else {
            return;
          }
        });
        rsvpNotResponded = Math.max(0, guestCount - (rsvpYes + rsvpNo));
        result.push({
          subEventTitle,
          rsvpYes,
          rsvpNo,
          rsvpNotResponded
        });
      });
    }
    return result;
  }
});

// App users, demography, guests data for Summary
export const getGuestSummary1 = new ValidatedMethod({
  name: "guestSummary",
  validate: null,
  run(eventId) {
    const event = Events.findOne({ _id: eventId });
    if (!event) {
      return [];
    }
    const result = Guests.aggregate([
      {
        $facet: {
          primary: [
            { $match: { eventId, guestIsPrimary: true } },
            { $count: "primary" }
          ],
          secondary: [
            { $match: { eventId, guestIsPrimary: false } },
            { $count: "secondary" }
          ],
          male: [
            { $match: { eventId, guestGender: "male" } },
            { $count: "male" }
          ],
          female: [
            { $match: { eventId, guestGender: "female" } },
            { $count: "female" }
          ],
          child: [
            { $match: { eventId, guestGender: "child" } },
            { $count: "child" }
          ],
          loggedIn: [
            {
              $match: {
                eventId,
                guestIsPrimary: true,
                accessToken: {
                  $exists: true
                }
              }
            },
            { $count: "loggedIn" }
          ]
        }
        // $project : {
        //   'primary': { $arrayElemAt: ["$primary", 0] },
        //   'secondary': { $arrayElemAt : ["$secondary", 0] },
        //   'male': { $arrayElemAt : ["$male", 0] },
        //   'female': { $arrayElemAt : ["$female", 0] },
        //   'child': { $arrayElemAt : ["$child", 0] }
        // }
      }
    ]);

    // return result;
    return {
      primary:
        result[0].primary[0] && result[0].primary[0].primary
          ? result[0].primary[0].primary
          : 0,
      secondary:
        result[0].secondary[0] && result[0].secondary[0].secondary
          ? result[0].secondary[0].secondary
          : 0,
      male:
        result[0].male[0] && result[0].male[0].male
          ? result[0].male[0].male
          : 0,
      female:
        result[0].female[0] && result[0].female[0].female
          ? result[0].female[0].female
          : 0,
      child:
        result[0].child[0] && result[0].child[0].child
          ? result[0].child[0].child
          : 0,
      loggedIn:
        result[0].loggedIn[0] && result[0].loggedIn[0].loggedIn
          ? result[0].loggedIn[0].loggedIn
          : 0
    };
  }
});

// Guest Preferences, food, size and special assistance
export const getPreferenceSummary = new ValidatedMethod({
  name: "getPreferenceSummary",
  validate: null,
  run(eventId) {
    const event = Events.findOne({ _id: eventId });
    if (!event) {
      return ["Event Not Found"];
    }
    const foodPreference = FoodPreferences.findOne({ eventId });
    const sizePreference = SizePreferences.findOne({ eventId });
    const specialAssistance = SpecialAssistancePreferences.findOne({ eventId });

    // Food Preferences
    const food = [];
    const foodOptions = foodPreference.foodPreferences;
    foodOptions.map(option => {
      const guestCount = Guests.find({
        eventId,
        foodPreference: option
      }).count();

      food.push({ option, guestCount });
    });

    // Size Preferences
    const size = [];
    const sizeOptions = sizePreference.sizePreferences;
    sizeOptions.map(option => {
      const guestCount = Guests.find({
        eventId,
        sizePreference: option
      }).count();

      size.push({ option, guestCount });
    });

    // Size Preferences
    const assistance = [];
    const preferencesOptions = specialAssistance.assistanceOptions;
    preferencesOptions.map(option => {
      const guestCount = Guests.find({
        eventId,
        specialAssistance: option
      }).count();

      assistance.push({ option, guestCount });
    });

    return {
      food: food,
      size: size,
      assistance: assistance
    };
  }
});

export const getGuestSummary = new ValidatedMethod({
  name: "Guests.methods.summary",
  validate: null,
  run(eventId) {
    let guests = Guests.find({ eventId, guestIsPrimary: true });
    let subevents = SubEvents.find({ eventId });
    let subeventCount = subevents.count();
    let registered = Guests.find({
      eventId,
      guestIsPrimary: true,
      accessToken: {
        $exists: true
      }
    });

    let male = Guests.find({
      eventId,
      guestGender: "male"
    });
    let female = Guests.find({
      eventId,
      guestGender: "female"
    });

    let child = Guests.find({
      eventId,
      guestGender: "child"
    });

    let totalGuests = Guests.find({ eventId });
    let primaryGuests = Guests.find({ eventId, guestIsPrimary: true });
    let rsvpYesCount = 0;
    let rsvpNoCount = 0;
    let foodPreferences = {};
    let sizePreferences = {};
    let specialPreferences = {};
    let newRsvpByDestination = {};
    let newRsvpByDate = {};

    let subEventByDestinations = {};
    let subEventByDate = {};
    // SUB EVENT GROUPING
    // subevents.forEach(se => {
    //   if (typeof subEventByDate[se.subEventDate] == 'undefined') {
    //     subEventByDate[se.subEventDate] = [];
    //   }
    //   if (typeof subEventByDestinations[se.subEventDestination] == 'undefined') {
    //     subEventByDestinations[se.subEventDestination] = [];
    //   }

    //   subEventByDate[se.subEventDate].push(se._id);
    //   subEventByDestinations[se.subEventDestination].push(se._id);

    // });

    totalGuests.forEach(g => {
      // for (var destination in subEventByDestinations) {
      //   if (typeof newRsvpByDestination[destination] == 'undefined') {
      //     newRsvpByDestination[destination] = {};
      //     newRsvpByDestination[destination].rsvpYes = 0;
      //     newRsvpByDestination[destination].rsvpNo = 0;
      //     newRsvpByDestination[destination].rsvpTotal = 0;

      //   }
      //   var subEventIds = subEventByDestinations[destination];
      //   let rsvpDestYes = RSVP.find({ subEventId: { $in: subEventIds }, guestId: g._id, status: true }).count();
      //   let rsvpDestNo = RSVP.find({ subEventId: { $in: subEventIds }, guestId: g._id, status: false }).count();
      //   let rsvpDestTotal = RSVP.find({ subEventId: { $in: subEventIds }, guestId: g._id }).count();
      //   if (rsvpDestTotal > 0 && rsvpDestYes > 0) {
      //     newRsvpByDestination[destination].rsvpYes = newRsvpByDestination[destination].rsvpYes + 1;
      //     newRsvpByDestination[destination].rsvpTotal = newRsvpByDestination[destination].rsvpTotal + 1;
      //   } else if (rsvpDestTotal > 0 && rsvpDestNo == rsvpDestTotal) {
      //     newRsvpByDestination[destination].rsvpNo = newRsvpByDestination[destination].rsvpNo + 1;
      //     newRsvpByDestination[destination].rsvpTotal = newRsvpByDestination[destination].rsvpTotal + 1;
      //   }

      // }
      // for (var dates in subEventByDate) {
      //   if (typeof newRsvpByDate[dates] == 'undefined') {
      //     newRsvpByDate[dates] = {};
      //     newRsvpByDate[dates].rsvpYes = 0;
      //     newRsvpByDate[dates].rsvpNo = 0;
      //     newRsvpByDate[dates].rsvpTotal = 0;

      //   }
      //   var subEventIds = subEventByDate[dates];
      //   let rsvpDateYes = RSVP.find({ subEventId: { $in: subEventIds }, guestId: g._id, status: true }).count();
      //   let rsvpDateNo = RSVP.find({ subEventId: { $in: subEventIds }, guestId: g._id, status: false }).count();
      //   let rsvpDateTotal = RSVP.find({ subEventId: { $in: subEventIds }, guestId: g._id }).count();
      //   if (rsvpDateTotal > 0 && rsvpDateYes > 0) {
      //     newRsvpByDate[dates].rsvpYes = newRsvpByDate[dates].rsvpYes + 1;
      //     newRsvpByDate[dates].rsvpTotal = newRsvpByDate[dates].rsvpTotal + 1;
      //   } else if (rsvpDateTotal > 0 && rsvpDateNo == rsvpDateTotal) {
      //     newRsvpByDate[dates].rsvpNo = newRsvpByDate[dates].rsvpNo + 1;
      //     newRsvpByDate[dates].rsvpTotal = newRsvpByDate[dates].rsvpTotal + 1;
      //   }

      // }

      // let rsvpYes = RSVP.find({ eventId, guestId: g._id, status: true });
      // let rsvpNo = RSVP.find({ eventId, guestId: g._id, status: false });

      // if (rsvpYes.count() > 0) {
      //   rsvpYesCount += 1;
      // }
      // else if (rsvpNo.count() >= subeventCount) {
      //   rsvpNoCount += 1;
      // }
      if (g.foodPreference) {
        let preference = g.foodPreference;
        let count = 1;
        if (foodPreferences.hasOwnProperty(preference)) {
          foodPreferences[preference].count += count;
        } else {
          foodPreferences[preference] = {
            preference,
            count
          };
        }
      }
      if (g.sizePreference) {
        let preference = g.sizePreference;
        let count = 1;
        if (sizePreferences.hasOwnProperty(preference)) {
          sizePreferences[preference].count += count;
        } else {
          sizePreferences[preference] = {
            preference,
            count
          };
        }
      }

      if (g.specialAssistance && g.specialAssistance.length > 0) {
        let preferences = g.specialAssistance;
        preferences.forEach(preference => {
          let count = 1;
          if (specialPreferences.hasOwnProperty(preference)) {
            specialPreferences[preference].count += count;
          } else {
            specialPreferences[preference] = {
              preference,
              count
            };
          }
        });
      }
    });

    let addedFoodPreferences = FoodPreferences.findOne({ eventId });
    if (addedFoodPreferences) {
      addedFoodPreferences.foodPreferences.forEach(preference => {
        if (!foodPreferences.hasOwnProperty(preference)) {
          foodPreferences[preference] = {
            preference,
            count: 0
          };
        }
      });
    }
    foodPreferences = _.toArray(foodPreferences);

    let addedSizePreferences = SizePreferences.findOne({ eventId });
    if (addedSizePreferences) {
      addedSizePreferences.sizePreferences.forEach(preference => {
        if (!sizePreferences.hasOwnProperty(preference)) {
          sizePreferences[preference] = {
            preference,
            count: 0
          };
        }
      });
    }
    sizePreferences = _.toArray(sizePreferences);

    let addedSpecialPreferences = SpecialAssistancePreferences.findOne({
      eventId
    });
    if (addedSpecialPreferences) {
      addedSpecialPreferences.assistanceOptions.forEach(preference => {
        if (!specialPreferences.hasOwnProperty(preference)) {
          specialPreferences[preference] = {
            preference,
            count: 0
          };
        }
      });
    }
    specialPreferences = _.toArray(specialPreferences);

    let rsvpBySubevent = {};
    let rsvpByDate = {};
    let rsvpByDestination = {};
    subevents.forEach(se => {
      let subEventId = se._id;
      let subrsvpYes = RSVP.find({ eventId, subEventId, status: true });
      let subrsvpNo = RSVP.find({ eventId, subEventId, status: false });
      let res = {
        _id: se._id,
        subEventName: se.subEventTitle,
        rsvpYes: subrsvpYes.count(),
        rsvpNo: subrsvpNo.count()
      };

      rsvpBySubevent[subEventId] = res;

      let subEventDestination = se.subEventDestination;
      let locationRes = {
        ...res,
        subEventDestination
      };

      if (rsvpByDestination.hasOwnProperty(subEventDestination)) {
        let obj = rsvpByDestination[subEventDestination];
        let final = {
          ...obj,
          rsvpYes: obj.rsvpYes + res.rsvpYes,
          rsvpNo: obj.rsvpNo + res.rsvpNo
        };
        rsvpByDestination[subEventDestination] = final;
      } else {
        rsvpByDestination[subEventDestination] = locationRes;
      }
      let subEventDate = se.subEventDate;
      let dateRes = {
        ...res,
        subEventDate
      };

      if (rsvpByDate.hasOwnProperty(subEventDate)) {
        let obj = rsvpByDate[subEventDate];
        let final = {
          ...obj,
          rsvpYes: obj.rsvpYes + res.rsvpYes,
          rsvpNo: obj.rsvpNo + res.rsvpNo
        };
        rsvpByDate[subEventDate] = final;
      } else {
        rsvpByDate[subEventDate] = dateRes;
      }
    });

    rsvpByDate = _.toArray(rsvpByDate);
    rsvpBySubevent = _.toArray(rsvpBySubevent);
    rsvpByDestination = _.toArray(rsvpByDestination);

    let hotels = Hotels.find({ eventId });
    let hotelInfo = hotels.map(h => {
      let hotelId = h._id;
      let totalRooms = Rooms.find({ eventId, hotelId }).count();
      let occupiedRooms = Rooms.find({
        eventId,
        hotelId,
        "assignedTo.0": {
          $exists: true
        }
      }).count();
      return {
        // hotelName: h.hotelName + ', '+ h.hotelAddressCity,
        hotelName: h.hotelName,
        totalRooms,
        occupiedRooms
      };
    });

    let hotelsForSale = Hotelsforsale.find({ eventId });
    let hotelForSaleInfo = hotelsForSale.map(h => {
      let hotelId = h._id;
      let totalRooms = RoomsForSale.find({ eventId, hotelId }).count();
      let occupiedRooms = RoomsForSale.find({
        eventId,
        hotelId,
        "assignedTo.0": {
          $exists: true
        }
      }).count();
      return {
        // hotelName: h.hotelName + ', '+ h.hotelAddressCity,
        hotelName: h.hotelName,
        totalRooms,
        occupiedRooms
      };
    });

    let flights = Flights.find({ eventId });
    let flightInfo = flights.map(fl => {
      let totalSeats = fl.flightTotalSeats;
      let flightId = fl._id;
      let bookedSeats = FlightBookings.find({ eventId, flightId }).count();
      let departureCityId = fl.flightLegs[0].flightDepartureCityId;
      let arrivalCityId =
        fl.flightLegs[fl.flightLegs.length - 1].flightArrivalCityId;
      let departureCity = Airports.findOne(departureCityId);
      let arrivalCity = Airports.findOne(arrivalCityId);
      let departureName = departureCity ? departureCity.airportIATA : "";
      let arrivalName = arrivalCity ? arrivalCity.airportIATA : "";
      return {
        name: `${departureName}->${arrivalName}`,
        totalSeats,
        bookedSeats
      };
    });

    let flightsForSale = Flightsforsale.find({ eventId });
    let flightForSaleInfo = flightsForSale.map(fl => {
      let totalSeats = fl.flightTotalTicketQty;
      let flightId = fl._id;
      let bookedSeats = FlightforsaleBookings.find({
        eventId,
        flightId
      }).count();
      let departureCityId = fl.flightLegs[0].flightDepartureCityId;
      let arrivalCityId =
        fl.flightLegs[fl.flightLegs.length - 1].flightArrivalCityId;
      let departureCity = Airports.findOne(departureCityId);
      let arrivalCity = Airports.findOne(arrivalCityId);
      let departureName = departureCity ? departureCity.airportIATA : "";
      let arrivalName = arrivalCity ? arrivalCity.airportIATA : "";
      return {
        name: `${departureName}->${arrivalName}`,
        totalSeats,
        bookedSeats
      };
    });

    let serviceInfo = [];
    let services = Services.find({ eventId });
    services.forEach(service => {
      let serviceId = service._id;
      let serviceName = service.serviceName;
      let slots = ServiceSlots.find({ serviceId });
      let slotsInfo = {};
      slots.forEach(slot => {
        let serviceDate = slot.serviceDate;
        let serviceTime = slot.serviceTime;
        let slotData = {
          serviceTime,
          slotTotal: 1,
          slotAvailable: slot.available === false ? 0 : 1
        };

        if (slotsInfo.hasOwnProperty(serviceDate)) {
          if (slotsInfo[serviceDate].hasOwnProperty(serviceTime)) {
            slotsInfo[serviceDate][serviceTime].slotTotal += slotData.slotTotal;
            slotsInfo[serviceDate][serviceTime].slotAvailable +=
              slotData.slotAvailable;
          } else {
            slotsInfo[serviceDate][serviceTime] = slotData;
          }
        } else {
          slotsInfo[serviceDate] = {
            [serviceTime]: slotData
          };
        }
      });

      serviceInfo.push({
        serviceId,
        serviceName,
        slotsInfo
      });
    });

    rsvpByDate.forEach(function(resDate, index) {
      if (typeof newRsvpByDate[resDate.subEventDate] != "undefined") {
        rsvpByDate[index].rsvpYes = newRsvpByDate[resDate.subEventDate].rsvpYes;
        rsvpByDate[index].rsvpNo = newRsvpByDate[resDate.subEventDate].rsvpNo;
      }
    });
    rsvpByDestination.forEach(function(resDest, index) {
      if (
        typeof newRsvpByDestination[resDest.subEventDestination] != "undefined"
      ) {
        rsvpByDestination[index].rsvpYes =
          newRsvpByDestination[resDest.subEventDestination].rsvpYes;
        rsvpByDestination[index].rsvpNo =
          newRsvpByDestination[resDest.subEventDestination].rsvpNo;
      }
    });

    return {
      total: guests.count(),
      registered: registered.count(),
      totalGuests: totalGuests.count(),
      primaryGuests: primaryGuests.count(),
      male: male.count(),
      female: female.count(),
      child: child.count(),
      rsvpByDate,
      rsvpBySubevent,
      rsvpByDestination,
      rsvpsYes: rsvpYesCount,
      rsvpsNo: rsvpNoCount,
      hotelInfo,
      hotelForSaleInfo,
      flightInfo,
      flightForSaleInfo,
      foodPreferences,
      sizePreferences,
      specialPreferences,
      serviceInfo
    };
  }
});

export const fetchGuestList = new ValidatedMethod({
  name: "fetch.guest.list",
  validate: null,
  run({ eventId, type }) {
    let guests;
    switch (type) {
      case "all_guest":
        guests = Guests.find(
          {
            eventId,
            guestIsPrimary: true
          },
          {
            fields: {
              _id: 1,
              guestFirstName: 1,
              guestLastName: 1,
              folioNumber: 1
            }
          }
        );
        break;
      case "not_logged_guest":
        guests = Guests.find(
          {
            eventId,
            guestIsPrimary: true,
            guestInviteSent: true,
            appLoginTime: { $exists: false }
          },
          {
            fields: {
              _id: 1,
              guestFirstName: 1,
              guestLastName: 1,
              folioNumber: 1
            }
          }
        );
        break;
      case "new_guest":
        guests = Guests.find(
          {
            eventId,
            guestIsPrimary: true,
            guestInviteSent: false
          },
          {
            fields: {
              _id: 1,
              guestFirstName: 1,
              guestLastName: 1,
              folioNumber: 1
            }
          }
        );
        break;
      default:
        guests = Guests.find(
          {
            eventId,
            guestIsPrimary: true
          },
          {
            fields: {
              _id: 1,
              guestFirstName: 1,
              guestLastName: 1,
              folioNumber: 1
            }
          }
        );
        break;
    }
    // console.log('Notifications Guests Count :: ', guests.count())
    return guests.fetch();
  }
});

export const getGuestByFolioNumber = new ValidatedMethod({
  name: "getGuestByFolioNumber",
  validate: null,
  run({ folioNumber, eventId }) {
    return Guests.find({ folioNumber: parseInt(folioNumber), eventId }).fetch();
  }
});
