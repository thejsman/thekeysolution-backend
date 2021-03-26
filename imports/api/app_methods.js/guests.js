import {
  func_bookService,
  func_bookService1,
} from "../../api/services/methods.js";
import { Meteor } from "meteor/meteor";
import request from "request";
import { Guests } from "../guests/guests.js";
import { Events } from "../events/events.js";
import { Airports } from "../airports/airports.js";
import { Airlines } from "../airlines/airlines.js";
import { SubEvents } from "../subevents/subevents.js";
import { RSVP } from "../rsvp/rsvp.js";
import { FlightBookings } from "../flights/flightBookings.js";
import { Flights } from "../flights/flights.js";
import { HotelBookings } from "../hotels/hotelBookings.js";
import { TransportBookings } from "../transport/transportbookings.js";
import { ServiceSlots } from "../services/services.js";
import { ServiceBookings } from "../services/serviceBooking.js";
import { Services } from "../services/services.js";
import { Hotels } from "../hotels/hotels.js";
import { Hotelsforsale } from "../hotelsforsale/hotelsforsale.js";
import { HotelforsaleBookings } from "../hotelsforsale/hotelforsaleBookings.js";
import { Rooms as Roomsforsale } from "../hotelsforsale/roomsforsale.js";
import { HTTP } from "meteor/http";
import { ReactiveVar } from "meteor/reactive-var";
import { Speakers } from "../speakers/speakers";
import { Sponsors } from "../sponsors/sponsors";
import { TransportDrivers } from "../transport/transport_drivers.js";
import { TransportVehicles } from "../transport/transport_vehicles.js";
import { AirportManager } from "../managers/airportmanager.js";
import { HospitalityManager } from "../managers/hospitalitymanager.js";
import { App_General } from "../app_general/app_general.js";
import { FoodPreferences } from "../preferences/foodpreference.js";
import { SizePreferences } from "../preferences/sizepreference.js";
import { SpecialAssistancePreferences } from "../preferences/specialassistancepreference.js";
import { GuestNotificationList } from "../notifications/notifications.js";
import { authorizer as Authorizer } from "s3up/server";
import { IncrementGuestCount } from "../guests/guestUtils.js";
import { insertPwaActivity } from "../../api/pwa_activity_record/methods.js";
import { Flightsforsale } from "../../api/flightsforsale/flightsforsale.js";
import { FlightforsaleBookings } from "../../api/flightsforsale/flightforsaleBookings.js";
import {
  PersonalbookFlight,
  PersonalRemoveFlightBooking,
  searchFlightByServer,
} from "../../api/flights/methods";
import { Photos, PhotoShareSetting } from "../photo_share/photo_share";
import { EventsGroups } from "../eventsGroups/eventsGroups";
import { PhotoLikedBy } from "../photoLikedBy/photoLikedBy";
import { FileWithFolioNumber } from "../fileWithFolioNumber/fileWithFolioNumber";
import { Downloads } from "../downloads/download";
import { Comments } from "../comments/comments";

import { PHOTOS } from "../../../constants";

import _ from "lodash";
import AWS from "aws-sdk";
import moment from "moment";
const authorizer = new Authorizer(Meteor.settings.S3);

let searchF = ReactiveVar({});

AWS.config.accessKeyId = Meteor.settings.S3.key;
AWS.config.secretAccessKey = Meteor.settings.S3.secret;
AWS.config.region = Meteor.settings.S3.region;
const s3 = new AWS.S3();

import { GetSignedURL } from "../../api/upload/S3Uploads.js";
import { Event_Meetings } from "../events_meeting/event_meetings";
import { Event_Meeting_Guest_Invitation } from "../events_meeting_invitation/events_meeting_invitation.js";

function getAirportId(abc) {
  let airport = Airports.findOne({
    airportIATA: abc,
  });
  return airport._id;
}

function getAirportDetails(abc) {
  let airport = Airports.findOne({
    _id: abc,
  });
  let airportData =
    airport.airportLocation +
    ", " +
    airport.airportCountry +
    " - " +
    airport.airportIATA;
  return airportData;
}

function getAirlineDetails(abc) {
  let airline = Airlines.findOne({
    airlineIATA: abc,
  });
  let airlineData = airline.airlineName + " - " + airline.airlineIATA;
  return airlineData;
}

function getAirlineId(abc) {
  let airline = Airlines.findOne({
    airlineIATA: abc,
  });
  return airline._id;
}

function formateDateTime(abc) {
  return moment(abc).format("LLL");
}

Meteor.methods({
  //start new code
  updateAppConfigFile(text_js, text_css) {
    var encoded_text_js = Buffer.from(text_js).toString("base64");
    var encoded_text_css = Buffer.from(text_css).toString("base64");

    let cssFile = new FS.File();
    cssFile.name("config.css");
    cssFile.attachData(
      "data:text/plain;base64," + encoded_text_css,
      function (error) {
        if (error) console.log("css error", error);
      }
    );

    let jsFile = new FS.File();
    jsFile.name("config.js");
    jsFile.attachData(
      "data:text/plain;base64," + encoded_text_js,
      function (error) {
        if (error) console.log(error);
        else {
          // console.log('dataa', jsFile);
          AppConfig.insert(jsFile, function (err, fileObj) {
            if (err) console.log("err ", err);
            else {
              AppConfig.insert(cssFile, function (err, fileObj1) {
                if (err) console.log("err ", err);
              });
            }
          });
        }
      }
    );
  },
  //end new code
  "book.paidFlight"(guestId, data) {
    var guest = Guests.findOne(guestId);
    if (!guest) {
      throw new Meteor.Error("Invalid guest Data!");
      return false;
    }
    if (data.length == 0) {
      throw new Meteor.Error("Invalid booking Data!");
      return false;
    }
    let event = Events.findOne(guest.eventId);
    if (!event) {
      throw new Meteor.Error("Invalid Event");
      return false;
    }

    _.each(data, (bookingData) => {
      var flight = Flightsforsale.findOne({ _id: bookingData.flightId });
      var passenger = Guests.findOne(bookingData.guestId);
      if (!flight) {
        throw new Meteor.Error("Invalid Flight Id!");
        return false;
      }
      // console.log('flight Data', flight);
      var insertData = {};
      insertData.guestId = bookingData.guestId;
      insertData.flightId = bookingData.flightId;
      insertData.flightBookingReferenceNo =
        bookingData.flightBookingReferenceNo;
      insertData.flightBookCost = flight.flightCostPerTicket;
      insertData.flightLegs = flight.flightLegs;
      // console.log('insert', insertData);
      // console.log('passenger', passenger);

      FlightforsaleBookings.insert(insertData);
      activityInsertData = {
        guestId: passenger._id,
        activityModule: "Guests",
        activitySubModule: "Flight Booking",
        activityMessage:
          "Paid Flight is booked for " +
          passenger.guestTitle +
          " " +
          passenger.guestFirstName +
          " " +
          passenger.guestLastName +
          ".",
      };
      activityRecordInsert(activityInsertData);
    });
  },
  "fetch.paidFlight.inventory"(guestId) {
    var guest = Guests.findOne(guestId);
    if (!guest) {
      throw new Meteor.Error("Invalid guest Data");
    }

    if (
      typeof guest.freeFlightTicket == "undefined" ||
      guest.freeFlightTicket == false
    ) {
      let event = Events.findOne(guest.eventId);
      if (!event) {
        throw new Meteor.Error("Invalid Event");
        return false;
      }
      let flights = Flightsforsale.find({ eventId: guest.eventId }).fetch();
      let airports = Airports.find().fetch();
      let airlines = Airlines.find().fetch();

      return { flights, airports, airlines };
    } else {
      throw new Meteor.Error("Guest not allowed to buy flight ticket!");
      return false;
    }
  },
  "book.hotelForSale"(guestId, data) {
    if (typeof data.hotelId == "undefined") {
      throw new Meteor.Error("Missing Hotel Id!");
      return;
    }
    if (typeof data.hotelRoomId == "undefined") {
      throw new Meteor.Error("Missing Hotel Room Id!");
      return;
    }
    if (typeof data.hotelRoomQty == "undefined" || data.hotelRoomQty <= 0) {
      throw new Meteor.Error("Missing Hotel Room Qty!");
      return;
    }
    if (typeof data.hotelBookingReferenceNo == "undefined") {
      throw new Meteor.Error("Missing Hotel Booking Number!");
      return;
    }
    if (typeof data.selectedPerson == "undefined") {
      throw new Meteor.Error("Missing Hotel Booking Number!");
      return;
    }
    if (typeof data.hotelAirpotPickupQuantities == "undefined") {
      data.hotelAirpotPickupQuantities = 0;
    }
    if (typeof data.hotelAirpotDropQuantities == "undefined") {
      data.hotelAirpotDropQuantities = 0;
    }
    if (typeof data.hotelBookingInstructions == "undefined") {
      data.hotelBookingInstructions = 0;
    }
    if (typeof data.hotelBookingTransactionId == "undefined") {
      data.hotelBookingTransactionId = 0;
    }

    var hotelForSale = Hotelsforsale.findOne(data.hotelId);
    // console.log(111111111);
    if (hotelForSale) {
      var vacant_rooms = Roomsforsale.find({
        hotelId: data.hotelId,
        hotelRoomId: data.hotelRoomId,
        assignedTo: [],
      });
      var book_count = data.hotelRoomQty;
      // console.log("data.selectedPerson", data.selectedPerson);
      vacant_rooms.map((vacant_room, index) => {
        if (book_count > 0) {
          // console.log("index", index);
          console.log("data.selectedPerson[index]", data.selectedPerson[index]);
          Roomsforsale.update(vacant_room.roomId, {
            $push: {
              assignedTo: {
                $each: data.selectedPerson[index],
              },
            },
          });
          var datetime = new Date();
          _.each(data.selectedPerson[index], (person) => {
            HotelforsaleBookings.insert({
              hotelBookingReferenceNo: data.hotelBookingReferenceNo,
              hotelId: data.hotelId,
              roomId: vacant_room.roomId,
              hotelRoomId: vacant_room.hotelRoomId,
              hotelRoomBookCost: vacant_room.hotelRoomCost,
              guestId: person,
              roomNumber: vacant_room.roomNumber,
              hotelRoomNumber: vacant_room.hotelRoomNumber,
              hotelRoomRemarks: vacant_room.hotelRoomRemarks,
              hotelAirpotPickupQuantities: data.hotelAirpotPickupQuantities,
              hotelAirpotDropQuantities: data.hotelAirpotDropQuantities,
              hotelBookingInstructions: data.hotelBookingInstructions,
              hotelBookingDateTime: datetime,
              hotelBookingTransactionId: data.hotelBookingTransactionId,
            });
            var data2 = {};
            data2.activityModule = "Guests";
            data2.activitySubModule = "Hotel Room book";
            data2.activityMessage =
              "Hotel room is booked in " + hotelForSale.hotelName;
            data2.guestId = guestId;
            activityRecordInsert(data2);
          });
          book_count = book_count - 1;
        }
      });
    } else {
      throw new Meteor.Error("Invalid hotel Id");
      return;
    }
  },
  "guest.login"({ userEmail, userPassword, eventId }) {
    let event = Events.findOne(eventId);
    if (!event) {
      throw new Meteor.Error("Invalid event");
    }
    let guest = Guests.findOne({
      eventId: eventId,
      guestPersonalEmail: userEmail,
      accessCode: userPassword,
    });
    if (!guest) {
      throw new Meteor.Error("Guest not found");
      return;
    }
    guest.accessToken = Random.id();
    Guests.update(
      {
        _id: guest._id,
      },
      {
        $set: {
          accessToken: guest.accessToken,
          appLoginTime: Date.now(),
        },
      }
    );
    // BOC TRACKER CODE
    var data = {};
    data.activityModule = "Login";
    data.activitySubModule = "Login";
    data.activityMessage = "Guest is Logged In.";
    data.guestId = guest._id;
    activityRecordInsert(data);

    // EOC TRACKER CODE
    return { guest, event };
  },

  "fetch.event"({ eventId }) {
    console.log(eventId);
    return Events.findOne(eventId);
  },

  "guest.rsvp.bulkSubmit"(guestId, data) {
    console.log("Updating RSVP :: ", guestId, data);
    const guest = Guests.findOne(guestId);
    const eventId = guest.eventId;
    const event = Events.findOne(eventId);

    if (!event || !guest) {
      throw new Meteor.Error("Invalid data");
    }

    _.each(data, (sub) => {
      const subEventId = sub.subeventId;
      RSVP.upsert(
        {
          eventId,
          guestId,
          subEventId,
        },
        {
          $set: {
            status: sub.status,
          },
        }
      );
    });

    // BOC TRACKER CODE

    var data = {};
    data.activityModule = "RSVP";
    data.activitySubModule = "RSVP";
    data.activityMessage = "Guest Updated RSVP Details.";
    data.guestId = guest._id;
    activityRecordInsert(data);

    // EOC TRACKER CODE
    return "success";
  },

  "guest.rsvp.submit"({ guestId, subeventId, status }) {
    var guest = Guests.findOne(guestId);
    var event = Events.findOne(guest.eventId);
    let eventId = guest.eventId;

    if (!event || !guest) {
      throw new Meteor.Error("Invalid data");
      return;
    }

    let subevents = _.map(subeventId.split(","), (s) => {
      return {
        subEventId: s,
        status: status,
      };
    });
    _.each(subevents, (sub) => {
      let subEventId = sub.subEventId;
      RSVP.upsert(
        {
          eventId,
          guestId,
          subEventId,
        },
        {
          $set: {
            status: sub.status,
          },
        }
      );
    });

    // BOC TRACKER CODE

    var data = {};
    data.activityModule = "RSVP";
    data.activitySubModule = "RSVP";
    data.activityMessage = "Guest Updated RSVP Details.";
    data.guestId = guest._id;
    activityRecordInsert(data);

    // EOC TRACKER CODE
  },

  "guest.clear.passport"({ guestId }) {
    Guests.update(guestId, {
      $set: {
        guestPassportImages: [],
      },
    });
    // BOC TRACKER CODE
    console.log("clear passport called");
    var data = {};
    data.activityModule = "My Information";
    data.activitySubModule = "My Photo ID";
    data.activityMessage = "Guest deleted passport images.";
    data.guestId = guestId;
    activityRecordInsert(data);
    // EOC TRACKER CODE
  },

  "guest.clear.visa"({ guestId }) {
    console.log("clear visa called");
    Guests.update(guestId, {
      $set: {
        guestVisaImages: [],
      },
    });
    var data = {};
    data.activityModule = "My Information";
    data.activitySubModule = "My Visa";
    data.activityMessage = "Guest deleted visa images.";
    data.guestId = guestId;
    activityRecordInsert(data);
  },

  "guest.clear.insurance"({ guestId }) {
    console.log("clear insurance called");
    Guests.update(guestId, {
      $set: {
        guestInsuranceImages: [],
      },
    });
    var data = {};
    data.activityModule = "My Information";
    data.activitySubModule = "My Insurance";
    data.activityMessage = "Guest deleted insurance images.";
    data.guestId = guestId;
    activityRecordInsert(data);
  },

  "guest.app.submit.details"(guestInfo) {
    if (guestInfo.isCompanion) {
      let guest = Guests.findOne(guestInfo.mainId);
      if (!guest) return;
      let id = Guests.insert({
        eventId: guest.eventId,
        guestIsPrimary: false,
        guestFamilyID: guest.guestFamilyID,
        ...guestInfo,
      });
      Guests.update(guest._id, {
        $set: {
          hasCompanion: true,
        },
      });
    } else {
      Guests.update(
        {
          _id: guestInfo.guestId,
        },
        {
          $set: guestInfo,
        }
      );
    }
  },

  "fcm.token.update"({ guestId, token, isWeb }) {
    console.log("fcm_token_update_call", { guestId, token });
    if (guestId && token) {
      Guests.update(guestId, {
        $set: {
          fcmToken: token,
        },
      });

      if (isWeb && Meteor.isServer) {
        const guest = Guests.findOne(guestId);
        console.log(Meteor.settings.firebase.serverKey);

        if (guest) {
          const url = `https://iid.googleapis.com/iid/v1/${token}/rel/topics/event-${guest.eventId}`;
          HTTP.call(
            "POST",
            url,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `key=${Meteor.settings.firebase.serverKey}`,
              },
            },
            (err, res) => {
              if (err) console.log(err);
              else console.log(res);
            }
          );
        }
      }
    }
  },

  "guest.delete.ticket"({ guestId, type }) {
    let ticketType = type === "arrival" ? "TicketsArrival" : "TicketsDeparture";
    if (type === "arrival") {
      Guests.update(guestId, {
        $set: {
          TicketsArrival: [],
        },
      });
    } else {
      Guests.update(guestId, {
        $set: {
          TicketsDeparture: [],
        },
      });
    }
    // BOC TRACKER CODE

    var data = {};
    data.activityModule = "Travel Details";
    data.activitySubModule = "Tickets";
    data.activityMessage =
      "Guest deleted " +
      (ticketType == "TicketsArrival" ? "Arrival" : "Departure") +
      " Tickets.";
    data.guestId = guestId;
    activityRecordInsert(data);

    // EOC TRACKER CODE
  },

  "guest.delete.ticket.text"({ guestId, id, type }) {
    let ticketType =
      type === "arrival" ? "TicketsArrivalForms" : "TicketsDepartureForms";

    Guests.update(guestId, {
      $pull: {
        [ticketType]: { _id: id },
      },
    });
  },

  "guest.submit.ticket.text"({ guestId, data, type }) {
    let ticketType =
      type === "arrival" ? "TicketsArrivalForms" : "TicketsDepartureForms";

    data._id = Random.id();

    Guests.update(guestId, {
      $push: {
        [ticketType]: data,
      },
    });
  },

  "guest.submit.ticket"({ guestId, ticketUrl, type }) {
    let ticketType = type === "arrival" ? "TicketsArrival" : "TicketsDeparture";
    Guests.update(guestId, {
      $push: {
        [ticketType]: ticketUrl,
      },
    });
    // BOC TRACKER CODE

    var data = {};
    data.activityModule = "Travel Details";
    data.activitySubModule = "Tickets";
    data.activityMessage =
      "Guest added " +
      (ticketType == "TicketsArrival" ? "Arrival" : "Departure") +
      " Tickets.";
    data.guestId = guestId;
    activityRecordInsert(data);

    // EOC TRACKER CODE
  },

  "fetch.available.services"(eventId) {
    let services = Services.find({
      eventId,
      "providers.0": {
        $exists: true,
      },
    }).fetch();
    let slots = ServiceSlots.find({
      eventId,
      available: {
        $ne: false,
      },
    }).fetch();

    //let slots =ServiceSlots.aggregate([
    //   {'$match':{'eventId':'Pt97ZAhLZWH4Hwmqo','available':{$ne: false}}},
    //   {'$group':{"_id":{eventId:"$eventId",serviceDate:"$serviceDate",serviceTime:"$serviceTime",serviceId:"$serviceId"}}},
    //   {$sort:{serviceTime:1} }
    //   ]);

    return { services, slots };
  },

  "book.services"(data) {
    func_bookService(data);
  },
  "book.bulk_services"(data) {
    // func_bookService(data);
    var result = func_bookService1(data);

    // BOC TRACKER CODE
    if (result.finalGuestId && result.finalGuestId.length > 0) {
      var data = {};
      data.activityModule = "My Preferences";
      data.activitySubModule = "Services";
      data.activityMessage = "Guest updated services";
      data.guestId = result.finalGuestId;
      activityRecordInsert(data);
    }
    // EOC TRACKER CODE
    return result;
  },

  "fetch.airportList"() {
    return Airports.find({}).fetch();
  },

  "fetch.airlineList"() {
    return Airlines.find({}).fetch();
  },

  "fetch.bookedFlight"(data) {
    // console.log("Guest ID --", data,"PWA Request :::::: xxxx", FlightBookings.find({ guestId: data }).fetch());
    let flights = [];
    let guestFlights = FlightBookings.find({
      guestId: data,
      agencyProvided: false,
    }).fetch();
    guestFlights.map((a) => {
      flights.push({
        _id: a._id,
        pnr: a.pnrNumber,
        flightNo: a.flightLegs[0].flightNo,
        airline: getAirlineDetails(a.flightLegs[0].airlineIATA),
        depCity: getAirportDetails(a.flightLegs[0].flightDepartureCityId),
        depTime: formateDateTime(a.flightLegs[0].flightDepartureTime),
        arrCity: getAirportDetails(a.flightLegs[0].flightArrivalCityId),
        arrTime: formateDateTime(a.flightLegs[0].flightArrivalTime),
      });
    });
    return flights;
  },

  "delete.bookedFlight"(bookingId) {
    // let guestFlights = FlightBookings.find({ guestId: guestId, agencyProvided: false }).fetch()
    PersonalRemoveFlightBooking.call(bookingId, (err, res) => {
      if (err) {
        console.log("Delete Flight from pwa Error :", err);
      } else {
        console.log("Flight Deleted by guest via pwa");
      }
    });
  },

  "search.flight"(data) {
    let res = searchFlightByServer({
      airlineCode: data.flightIATA,
      flightNo: data.flightNo,
      date: data.flightDate,
    });

    return res.data.scheduledFlights;
  },

  // Add flights by guest on pwa
  "book.guest_flight"(data) {
    let d2 = {
      agencyProvided: false,
      eventId: data.eventId,
      guestId: data.guestId,
      pnrNumber: data.pnrNumber,
      flightLegs: [
        {
          airlineIATA: data.airlineIATA,
          flightArrivalCityId: getAirportId(data.arrivalAirport),
          flightArrivalGate: data.arrivalGate,
          flightArrivalTerminal: data.arrivalTerminal,
          flightArrivalTime: data.arrivalTime,
          flightDepartureCityId: getAirportId(data.departureAirport),
          flightDepartureGate: data.departureGate,
          flightDepartureTerminal: data.departureTerminal,
          flightDepartureTime: data.departureTime,
          flightNo: data.flightNo,
          flightId: getAirlineId(data.airlineIATA),
          _id: Random.id(),
        },
      ],
    };

    let activitydata = {
      activityModule: "My Flights",
      activitySubModule: "Travel",
      activityMessage: "Flight information added by guest.",
      guestId: data.guestId,
    };

    PersonalbookFlight.call(d2, (err, res) => {
      if (err) {
        console.log("Add Flight from pwa Error :", err);
      } else {
        // Insert activity
        activityRecordInsert(activitydata);
      }
    });
  },

  get_signed_url(opts) {
    return GetSignedURL(opts, "bmtimages");
  },

  authorize_upload: function (ops) {
    this.unblock();
    return authorizer.authorize_upload(ops);
  },

  "fetch.app.settings"(eventId) {
    let appDetails = App_General.findOne({ eventId });
    return appDetails;
  },

  "fetch.guest.summary"(guestId) {
    let guest = Guests.findOne(guestId);
    if (!guest) {
      throw new Meteor.Error("Guest Not Found");
    }

    let event = Events.findOne(guest.eventId);
    let fam = Guests.find({
      eventId: guest.eventId,
      guestFamilyID: guest.guestFamilyID,
    }).fetch();
    if (fam) {
      fam.sort(function (x, y) {
        return x.guestIsPrimary === y.guestIsPrimary
          ? 0
          : x.guestIsPrimary
          ? -1
          : 1;
      });
    }

    let summary = fam.map((f) => {
      return getBookings(f);
    });
    return summary ? summary : "";
  },

  "guest.fetch.all"({ eventId, guestId }) {
    return Guests.find(
      {
        eventId,
        guestIsPrimary: true,
        _id: {
          $ne: guestId,
        },
      },
      {
        fields: {
          _id: 1,
          guestPersonalEmail: 1,
          guestFirstName: 1,
          guestLastName: 1,
        },
      }
    ).fetch();
  },

  "fetch.guest.rsvp"(guestId) {
    let guest = Guests.findOne(guestId);

    if (!guest) {
      throw new Meteor.Error("Guest Not Found");
    }

    let event = Events.findOne(guest.eventId);

    let fam = Guests.find({
      eventId: guest.eventId,
      guestFamilyID: guest.guestFamilyID,
    });
    let guestIds = fam.map((g) => {
      return g._id;
    });
    let rsvps = RSVP.find({
      guestId: {
        $in: guestIds,
      },
    });

    let subeventSearchObj = {
      eventId: guest.eventId,
    };
    if (guest.inviteStatus) {
      let subeventSearchIds = [];
      _.each(guest.inviteStatus, (inv) => {
        if (inv.status === true) {
          subeventSearchIds.push(inv.subEventId);
        }
      });
      subeventSearchObj = {
        ...subeventSearchObj,
        _id: {
          $in: subeventSearchIds,
        },
      };
    }

    let subEvents = SubEvents.find(subeventSearchObj);

    return getRSVPInfo(fam, event, rsvps.fetch(), subEvents);
  },

  "guest.fetch.airports"() {
    return Airports.find(
      {},
      {
        fields: {
          _id: 1,
          airportCountry: 1,
          airportIATA: 1,
        },
      }
    ).fetch();
  },

  "fetch.guest.subevents"({ eventId, guestId }) {
    let subeventSearchObj = {
      eventId: eventId,
    };
    let guest = Guests.findOne(guestId);
    if (guest && guest.inviteStatus) {
      let subeventSearchIds = [];
      _.each(guest.inviteStatus, (inv) => {
        if (inv.status === true) {
          subeventSearchIds.push(inv.subEventId);
        }
      });
      subeventSearchObj = {
        ...subeventSearchObj,
        _id: {
          $in: subeventSearchIds,
        },
      };
    }

    return SubEvents.find(subeventSearchObj).fetch();
  },

  "fetch.guest"(guestId) {
    return Guests.findOne(guestId);
  },

  "photoshare.allGuests"(eventId) {
    return Guests.find({ eventId }).fetch();
  },

  "fetch.speakers"(eventId) {
    let speakers = Speakers.find({ eventId: eventId }).fetch();
    return speakers;
  },

  "fetch.sponsors"(eventId) {
    let sponsors = Sponsors.find({ eventId: eventId }).fetch();
    return sponsors;
  },

  "fetch.guest.notifications"({ eventId, guestId }) {
    let notifs = GuestNotificationList.find({
      $or: [
        {
          guestId,
          eventId,
          sentToAll: false,
        },
        {
          eventId,
          sentToAll: true,
        },
      ],
    }).fetch();
    console.log(notifs);
    return notifs;
  },

  "fetch.guest.family"(guestId) {
    let guest = Guests.findOne(guestId);

    if (!guest) {
      throw new Meteor.Error("Guest not found");
    }

    let family = Guests.find({
      eventId: guest.eventId,
      guestFamilyID: guest.guestFamilyID,
    }).fetch();
    if (family) {
      family.sort(function (x, y) {
        return x.guestIsPrimary === y.guestIsPrimary
          ? 0
          : x.guestIsPrimary
          ? -1
          : 1;
      });
    }
    return family;
  },

  "event.preferences"(eventId) {
    let foodPreference = FoodPreferences.findOne({ eventId });
    let sizePreference = SizePreferences.findOne({ eventId });
    let specialPreference = SpecialAssistancePreferences.findOne({ eventId });

    return {
      foodPreference,
      sizePreference,
      specialPreference,
    };
  },
  // BOC NEW METHOD FOR PWA
  "guest.details.submit"({ guestId, data }) {
    var guest = Guests.findOne(guestId);

    if (!guest) {
      throw new Meteor.Error("Invalid data" + guestId);
    }
    var valid_data = data;
    console.log("valid_data", valid_data);
    if (typeof valid_data.guestPersonalEmail != "undefined") {
      delete valid_data.guestPersonalEmail;
    }

    Guests.upsert(
      {
        _id: guestId,
      },
      {
        $set: valid_data,
      }
    );

    // BOC TRACKER CODE

    var activity_data = {};
    activity_data.activityModule = "My Information";
    activity_data.activitySubModule = "General";
    activity_data.activityMessage = "Guest Information updated.";
    activity_data.guestId = guestId;

    if (valid_data.foodPreference || valid_data.foodPreferencesRemark) {
      activity_data.activityModule = "My Preferences";
      activity_data.activitySubModule = "Meal Preferences";
      activity_data.activityMessage = `Guest updated meal preferences - ${
        valid_data.foodPreference
          ? valid_data.foodPreference
          : valid_data.foodPreferencesRemark
      }`;
    } else if (valid_data.sizePreference || valid_data.sizePreferenceRemark) {
      activity_data.activityModule = "My Preferences";
      activity_data.activitySubModule = "Merchandize Size";
      activity_data.activityMessage = `Guest updated merchandize size - ${
        valid_data.sizePreference
          ? valid_data.sizePreference
          : valid_data.sizePreferenceRemark
      }`;
    } else if (
      valid_data.specialAssistance ||
      valid_data.specialAssistanceRemark
    ) {
      activity_data.activityModule = "My Preferences";
      activity_data.activitySubModule = "Special Assistance";
      activity_data.activityMessage = `Guest updated special assistance - ${
        valid_data.specialAssistance
          ? valid_data.specialAssistance
          : valid_data.specialAssistanceRemark
      }`;
    } else if (valid_data.guestWish) {
      activity_data.activityModule = "Wishes";
      activity_data.activitySubModule = "Wishes";
      activity_data.activityMessage = "Guest added wishes in event.";
    } else if (valid_data.guestFeedbacks) {
      activity_data.activityModule = "Feedback";
      activity_data.activitySubModule = "Feedback";
      activity_data.activityMessage = "Guest added feedbacks in event.";
    } else if (valid_data.guestTitle) {
      activity_data.activityModule = "My Information";
      activity_data.activitySubModule = "My Details";
      activity_data.activityMessage = "Guest updated 'My Details' section.";
    } else if (valid_data.guestAddress1) {
      activity_data.activityModule = "My Information";
      activity_data.activitySubModule = "My Address";
      activity_data.activityMessage = "Guest updated address details.";
    } else if (valid_data.guestPhotoID) {
      activity_data.activityModule = "My Information";
      activity_data.activitySubModule = "My PhotoID";
      activity_data.activityMessage = "Guest updated profile photo.";
    } else if (valid_data.guestVisaImages) {
      activity_data.activityModule = "My Information";
      activity_data.activitySubModule = "My Visa";
      activity_data.activityMessage = "Guest updated visa photo.";
    } else if (valid_data.guestInsuranceImages) {
      activity_data.activityModule = "My Information";
      activity_data.activitySubModule = "My Insurance";
      activity_data.activityMessage = "Guest updated insurance photo.";
    } else if (valid_data.insuranceInfo) {
      valid_data.insuranceInfo.validInsurance = true;
      activity_data.activityModule = "My Information";
      activity_data.activitySubModule = "My Insurance";
      activity_data.activityMessage = "Guest updated insurance details.";
    } else if (valid_data.guestPassportImages) {
      activity_data.activityModule = "My Information";
      activity_data.activitySubModule = "Passport";
      activity_data.activityMessage = "Guest added passport images.";
    }

    activityRecordInsert(activity_data);

    // EOC TRACKER CODE
  },
  // EOC NEW METHOD FOR PWA

  // ABL SAM BOC : FETCH PAID HOTEL INVENTORY

  "fetch.paidHotel.inventory"(guestId) {
    var guest = Guests.findOne(guestId);
    if (!guest) {
      throw new Meteor.Error("Invalid data");
    }

    if (
      typeof guest.freeHotelRoom == "undefined" ||
      guest.freeHotelRoom == false
    ) {
      let event = Events.findOne(guest.eventId);
      if (!event) {
        throw new Meteor.Error("Invalid Event");
        return false;
      }
      let hotels = Hotelsforsale.find({ eventId: guest.eventId }).fetch();

      let rooms = Roomsforsale.find({
        eventId: guest.eventId,
        "assignedTo.0": { $exists: false },
      }).fetch();

      return { hotels, rooms };
    } else {
      throw new Meteor.Error("Guest not allowed to buy hotel room!");
      return false;
    }
  },

  // ABL SAM EOC : FETCH PAID HOTEL INVENTORY

  // ABL SAM BOC : RSVP STYLE 3
  "guest.rsvp.register"(guestId, registerData) {
    //  UPDATE registerData to guest table using guest id + update isRegisterd field to true.
    var guest = Guests.findOne(guestId);

    var subevent_id = [];
    var subevent_status = [];
    registerData.guestIsRegistered = [];

    if (guest.guestIsRegistered) {
      if (guest.guestIsRegistered instanceof Array) {
        registerData.guestIsRegistered.push("true");
      } else {
        registerData.guestIsRegistered = ["true"];
      }
    }

    Guests.update(guestId, {
      $set: registerData,
    });

    var subevent = SubEvents.find({ eventId: guest.eventId }).fetch();
    console.log("subevent", subevent);

    if (subevent) {
      subevent.map((sb) => {
        subevent_id.push(sb._id);
        subevent_status.push({ subEventId: sb._id, status: true });
      });
      console.log("subevent id", subevent_id);

      for (var i = 0; i < subevent_id.length; i++) {
        var eventId = guest.eventId;
        var guestId = guestId;
        var subEventId = subevent_id[i];

        RSVP.upsert(
          {
            eventId,
            guestId,
            subEventId,
          },
          {
            $set: {
              status: true,
            },
          },
          function (err, succ) {
            console.log("status", err, succ);
          }
        );
      }
    }

    // BOC TRACKER CODE

    var data = {};
    data.activityModule = "My Preferences";
    data.activitySubModule = "Services";
    data.activityMessage = "Guest is registered for event.";
    data.guestId = guestId;
    activityRecordInsert(data);

    // EOC TRACKER CODE
  },
  "guest.insert.campanion"(guestId, data) {
    //  INSERT  new Guest family member with same logic as in dashboard.

    var guest = Guests.findOne({ guestId });
    var subevent_status = [];
    var subevent_id = [];
    data.guestFamilyID = guest.guestFamilyID;
    data.eventId = guest.eventId;
    data.guestIsPrimary = false;

    var event = Events.findOne({
      _id: guest.eventId,
    });

    if (event) {
      var subevent = SubEvents.find({ eventId: guest.eventId }).fetch();
      if (subevent) {
        subevent.map((sb) => {
          subevent_id.push(sb._id);
          subevent_status.push({ subEventId: sb._id, status: true });
        });
      }

      let alreadyExists = Guests.findOne({
        guestPersonalEmail: data.guestPersonalEmail,
        eventId: data.eventId,
      });

      var count = IncrementGuestCount(data.eventId);
      if (alreadyExists) {
        let em = data.guestPersonalEmail.split("@");
        let f = Array(5 - String(count).length + 1).join("0") + count;
        data.guestPersonalEmail = em[0] + "+family" + f + "@" + em[1];
        data.count = count;
      }
      data.accessCode = Math.floor(1000 + Math.random() * 9000).toString();
      data.folioNumber = count;
      Guests.insert(data, function (err, success) {
        if (success) {
          for (var i = 0; i < subevent_id.length; i++) {
            var eventId = guest.eventId;
            var guestId = success;
            var subEventId = subevent_id[i];

            RSVP.upsert(
              {
                eventId,
                guestId,
                subEventId,
              },
              {
                $set: {
                  status: true,
                },
              },
              function (err, succ) {
                console.log("status", err, succ);
              }
            );
          }
        }
      });
      Guests.update(guest._id, {
        $set: {
          hasCompanion: true,
        },
      });
    } else {
      throw new Meteor.Error("Invalid Event");
      return;
    }
    // BOC TRACKER CODE

    var data = {};
    data.activityModule = "RSVP";
    data.activitySubModule = "Registration";
    data.activityMessage = "Guest added a companion for the event.";
    data.guestId = guestId;
    activityRecordInsert(data);

    // EOC TRACKER CODE
  },

  // PhotoShare Section starts here//

  "photoshare.fetchSettings"(eventId) {
    return PhotoShareSetting.find({ eventId }).fetch();
  },

  "photoshare.featuredPhotos"(eventId) {
    const sticky = Photos.find(
      {
        eventId: eventId,
        featured: true,
        isDeleted: false,
        sticky: true,
        status: "published",
      },
      { sort: { createdAt: -1 } }
    ).fetch();
    const photos = Photos.find(
      {
        eventId: eventId,
        featured: true,
        isDeleted: false,
        sticky: false,
        status: "published",
      },
      { sort: { createdAt: -1 } }
    ).fetch();
    return photos.reduce(
      (accum, photo) => {
        const date =
          photo.createdAt && new Date(photo.createdAt).toDateString();
        if (accum[date]) {
          accum[date].push(photo);
        } else {
          accum[date] = [photo];
        }
        return accum;
      },
      {
        Sticky: sticky,
      }
    );
  },

  "photoshare.sharedPhotos"({ category, eventId, guestId }) {
    let photos = [];
    if (category == PHOTOS.GUESTS) {
      const eventGroupsId = EventsGroups.find({
        eventId: eventId,
        members: { $all: [guestId] },
      })
        .fetch()
        .map((group) => group._id);
      photos = Photos.find(
        {
          eventId: eventId,
          featured: false,
          isDeleted: false,
          status: "published",
          groupId: { $in: [...eventGroupsId, null] },
        },
        { sort: { createdAt: -1 } }
      ).fetch();
    } else if (category == PHOTOS.SHAREDBYME) {
      photos = Photos.find(
        { createdBy: guestId, isDeleted: false, status: "published" },
        { sort: { createdAt: -1 } }
      ).fetch();
    } else if (category == PHOTOS.FAVORITE) {
      const photoIds = PhotoLikedBy.find({ guestId: guestId })
        .fetch()
        .map((item) => item.photoId);
      photos =
        photoIds && photoIds.length
          ? Photos.find(
              { isDeleted: false, status: "published", _id: { $in: photoIds } },
              { sort: { createdAt: -1 } }
            ).fetch()
          : [];
    } else if (category == PHOTOS.MOSTLIKED) {
      const likedCount = PhotoLikedBy.aggregate([
        {
          $match: {
            eventId,
          },
        },
        {
          $group: {
            _id: "$photoId",
            count: { $sum: 1 },
          },
        },
      ]);

      const countObj = {};
      const photoIds = likedCount.map((item) => {
        countObj[item._id] = item.count;
        return item._id;
      });
      photos =
        photoIds && photoIds.length
          ? Photos.find(
              {
                isDeleted: false,
                status: "published",
                featured: false,
                _id: { $in: photoIds },
              },
              { sort: { createdAt: -1 } }
            )
              .fetch()
              .map((item) => {
                item.count = countObj[item._id];
                return item;
              })
              .sort((a, b) => b.count - a.count)
          : [];

      return photos.reduce((accum, photo) => {
        const label = `Liked Count ${photo.count}`;
        if (accum[label]) {
          accum[label].push(photo);
        } else {
          accum[label] = [photo];
        }
        return accum;
      }, {});
    }

    return photos.reduce((accum, photo) => {
      const date = photo.createdAt && new Date(photo.createdAt).toDateString();
      if (accum[date]) {
        accum[date].push(photo);
      } else {
        accum[date] = [photo];
      }
      return accum;
    }, {});
  },

  "photoshare.photoDetail"({ photoId, guestId, eventId }) {
    const photo = Photos.find({
      _id: photoId,
      isDeleted: false,
      status: "published",
    }).fetch();
    const likedCount = PhotoLikedBy.find({ photoId }).count();
    const youLiked = PhotoLikedBy.find({ photoId, guestId }).fetch();
    const createdBy = Guests.findOne(photo[0].createdBy);
    const commentCount = Comments.find({ photoId }).count();
    let eventGroups;
    if (photo[0].groupId) {
      eventGroups = EventsGroups.findOne(photo[0].groupId);
    }

    return {
      photo: photo[0],
      likedCount,
      commentCount,
      youLiked: youLiked.length,
      groupDetails: eventGroups,
      createdBy,
    };
  },
  "photoshare.photoDownload"({ photoUrl }) {
    if (photoUrl) {
      return new Promise((resolve, reject) => {
        request
          .defaults({ encoding: null })
          .get(photoUrl, (error, response, body) => {
            if (!error && response.statusCode == 200) {
              data =
                "data:" +
                response.headers["content-type"] +
                ";base64," +
                new Buffer(body).toString("base64");
              resolve({
                base64: data,
              });
            } else {
              return { base64: "" };
            }
          });
      });
    } else {
      return { base64: "" };
    }
  },

  "photoshare.like.photo"({ guestId, photoId, eventId }) {
    const likedStatus = PhotoLikedBy.find({ photoId, guestId }).fetch();
    if (likedStatus.length) {
      PhotoLikedBy.remove({ photoId, guestId });
    } else {
      PhotoLikedBy.insert({ guestId, photoId, eventId, createdAt: new Date() });
    }
    return !likedStatus.length;
  },

  "photoshare.delete.photo"({ guestId, photoId }) {
    const response = Photos.update(
      {
        _id: photoId,
      },
      {
        $set: {
          isDeleted: true,
          updatedAt: new Date(),
        },
      }
    );

    return true;
  },

  "photoshare.save.sharedPhotos"(data) {
    const event = Events.findOne(data.eventId);

    if (!event) {
      throw new Meteor.Error("Invalid eventId:" + data.eventId);
    }

    data.createdAt = new Date();
    data.isDeleted = false;

    const photoId = Photos.insert(data);
    return {
      key: data.createdAt.toDateString(),
      data: {
        ...data,
        _id: photoId,
      },
    };
  },

  "photoshare.save.comment"(data) {
    const photo = Photos.find({
      _id: data.photoId,
      isDeleted: false,
      status: "published",
    });

    if (!photo) {
      throw new Meteor.Error("Invalid photoId:" + data.photoId);
    }

    data.createdAt = new Date();
    if (!data.parentCommentId) {
      data.parentCommentId = null;
    }

    const commentId = Comments.insert(data);
    const guest = Guests.findOne(
      { _id: data.commentedBy },
      { fields: { guestTitle: 1, guestFirstName: 1, guestLastName: 1 } }
    );

    return {
      ...data,
      guest,
      _id: commentId,
    };
  },

  "photoshare.comments"({ photoId, parentCommentId = null }) {
    const comments = Comments.find({ photoId, parentCommentId }).fetch();
    let parentComment;
    if (parentCommentId) {
      parentComment = Comments.findOne(parentCommentId);
      if (parentComment.commentedBy) {
        const guest = Guests.findOne(
          { _id: parentComment.commentedBy },
          { fields: { guestTitle: 1, guestFirstName: 1, guestLastName: 1 } }
        );
        parentComment = { ...parentComment, guest };
      }
    }

    const ids = comments.reduce(
      (accum, comment) => {
        accum.guestList.push(comment.commentedBy);
        accum.comments.push(comment._id);
        return accum;
      },
      {
        guestList: [],
        comments: [],
      }
    );

    const guestInfo = Guests.find(
      {
        _id: {
          $in: ids.guestList,
        },
      },
      { fields: { guestTitle: 1, guestFirstName: 1, guestLastName: 1 } }
    ).fetch();

    const childCount = Comments.aggregate([
      {
        $match: {
          parentCommentId: {
            $in: ids.comments,
          },
        },
      },
      {
        $group: {
          _id: "$parentCommentId",
          count: { $sum: 1 },
        },
      },
    ]);

    return {
      comments: comments.map((comment) => {
        return {
          ...comment,
          childCount: childCount.find((child) => child._id === comment._id),
          guest: guestInfo.find((guest) => guest._id === comment.commentedBy),
        };
      }),
      parentComment,
    };
  },

  "photoshare.likes"(photoId) {
    const likes = PhotoLikedBy.find({ photoId }).fetch();
    const guestList = likes.reduce((accum, like) => {
      accum.push(like.guestId);
      return accum;
    }, []);

    const guestInfo = Guests.find(
      {
        _id: {
          $in: guestList,
        },
      },
      { fields: { guestTitle: 1, guestFirstName: 1, guestLastName: 1 } }
    ).fetch();

    return likes.map((like) => {
      return {
        ...like,
        guest: guestInfo.find((guest) => guest._id === like.guestId),
      };
    });
  },

  "photoshare.create.group"(data) {
    const event = Events.findOne(data.eventId);

    if (!event) {
      throw new Meteor.Error("Invalid eventId:" + data.eventId);
    }

    if (data._id) {
      const groupId = data._id;
      data.updatedAt = new Date();
      delete data._id;
      const group = EventsGroups.update(
        {
          _id: groupId,
        },
        {
          $set: {
            ...data,
          },
        }
      );
      return {
        ...data,
        _id: groupId,
      };
    } else {
      data.createdAt = new Date();

      const groupId = EventsGroups.insert(data);
      return {
        ...data,
        _id: groupId,
      };
    }
  },

  "photoshare.guest.groups"({ eventId, guestId }) {
    // return EventsGroups.find({ eventId, members: [ guestId ]}).fetch();
    const eventGroups = EventsGroups.find({
      eventId: eventId,
      members: { $all: [guestId] },
    }).fetch();
    return eventGroups;
  },

  "downloads.sections"({ eventId, guestId }) {
    // const files = FileWithFolioNumber.find({ eventId : eventId, guestId: {
    //   $in: [guestId, null]
    // } }, { sort: { createdAt: -1 }}).fetch();
    // return files;

    let guest = Guests.findOne(guestId);
    if (!guest) {
      throw new Meteor.Error("Guest Not Found");
    }

    let fam = Guests.find({ guestFamilyID: guest.guestFamilyID }).fetch();
    let guestIds = fam.map((g) => {
      return g._id;
    });

    const files = FileWithFolioNumber.aggregate([
      {
        $match: {
          eventId: eventId,
          guestId: {
            $in: [...guestIds, null],
          },
        },
      },
      {
        $group: {
          _id: "$sections",
          records: {
            $push: "$$ROOT",
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const sections = Downloads.find({
      _id: {
        $in: files.map(({ _id }) => _id),
      },
    }).fetch();
    const finalSections = sections.map((section) => {
      return {
        ...files.find(({ _id }) => _id === section._id),
        ...section,
      };
    });

    return finalSections;
  },

  // event meeting
  "fetch.event.meetinglist"({ eventId, guestId }) {
    const guest = Guests.findOne(guestId);

    let objGuestEventMeetingList = Event_Meeting_Guest_Invitation.find({
      eventId: eventId,
      guestId: guestId,
    }).fetch();

    let objEventMeetingList = Event_Meetings.find({
      eventId: eventId,
      removed: false,
    }).fetch();

    let res = [];

    objGuestEventMeetingList.map((item) => {
      objEventMeetingList.map((item1) => {
        if (item.eventMeeting_id === item1._id)
          res.push({ ...item, meetingDetails: item1 });
      });
    });

    return {
      guestPersonalEmail: guest.guestPersonalEmail,
      guestLastName: guest.guestLastName,
      guestFirstName: guest.guestFirstName,
      meetinglist: res,
    };
  },

  // Photoshare section ends here
});

Meteor.publish("guest.app.all", (guestId) => {
  let guest = Guests.findOne(guestId);
  if (!guest) {
    throw new Meteor.Error("Guest Not Found");
  }

  let fam = Guests.find({
    eventId: guest.eventId,
    guestFamilyID: guest.guestFamilyID,
  });
  let guestIds = fam.map((g) => {
    return g._id;
  });

  let subEvents = SubEvents.find({
    eventId: guest.eventId,
  });

  let flightBookings = FlightBookings.find({
    eventId: guest.eventId,
    guestId: {
      $in: guestIds,
    },
  });

  let flightIds = [];
  let airportIds = [];
  flightBookings.forEach((b) => {
    _.each(b.flightLegs, (leg) => {
      flightIds.push(leg.flightId);
      airportIds.push(leg.flightArrivalCityId);
      airportIds.push(leg.flightDepartureCityId);
    });
  });

  let airlines = Airlines.find({
    _id: {
      $in: flightIds,
    },
  });

  let airports = Airports.find({
    _id: {
      $in: airportIds,
    },
  });

  let hotelBookings = HotelBookings.find({
    eventId: guest.eventId,
    guestId: {
      $in: guestIds,
    },
  });

  let hotelIds = hotelBookings.map((h) => h.hotelId);

  let hotels = Hotels.find({
    _id: { $in: hotelIds },
  });

  return [
    fam,
    subEvents,
    flightBookings,
    airlines,
    airports,
    hotelBookings,
    hotels,
  ];
});

function getBookings(guest) {
  let flightBookings = FlightBookings.find({ guestId: guest._id }).fetch();

  let airportIds = [];
  let airlineIds = [];
  let flights = flightBookings.map((fb) => {
    let flight = Flights.findOne(fb.flightId);
    if (!flight) {
      flight = { flightLegs: fb.flightLegs };
    }
    flight.flightLegs.forEach((leg) => {
      airlineIds.push(leg.flightId);
      airportIds.push(leg.flightDepartureCityId);
      airportIds.push(leg.flightArrivalCityId);
    });
    return {
      ...flight,
      ...fb,
    };
  });
  let airports = Airports.find({ _id: { $in: airportIds } }).fetch();
  let airlines = Airlines.find({ _id: { $in: airlineIds } }).fetch();

  let hotelBookings = HotelBookings.find({ guestId: guest._id }).fetch();
  let hotelIds = hotelBookings.map((bookin) => {
    let hotel = Hotels.findOne(bookin.hotelId);
    return hotel._id;
  });

  let hotels = Hotels.find({ _id: { $in: hotelIds } }).fetch();

  const guestHotel = HotelBookings.find({
    eventId: guest.eventId,
    guestId: guest._id,
  }).fetch();

  const roomSharer = HotelBookings.find({
    eventId: guest.eventId,
    hotelId: { $in: guestHotel.map((g) => g.hotelId) },
    roomId: { $in: guestHotel.map((g) => g.roomId) },
    placeHolderRoomNumber: {
      $in: guestHotel.map((g) => g.placeHolderRoomNumber),
    },
  }).fetch();
  const roomSharerName = Guests.find(
    {
      eventId: guest.eventId,
      _id: { $in: roomSharer.map((g) => g.guestId) },
    },
    {
      fields: {
        _id: 1,
        guestTitle: 1,
        guestFirstName: 1,
        guestLastName: 1,
      },
    }
  ).fetch();

  let serviceBookings = ServiceBookings.find({ guestId: guest._id }).fetch();

  let serviceIds = [];
  serviceBookings.forEach((b) => {
    serviceIds.push(b.serviceId);
  });

  let services = Services.find({ _id: { $in: serviceIds } }).fetch();
  let sizePreference = SizePreferences.findOne({ eventId: guest.eventId });

  let visa = guest.visaInformation;
  let preferences = {
    food: {
      preference: guest.foodPreference,
      remark: guest.foodPreferencesRemark,
    },
    specialAssistance: {
      preference: guest.specialAssistance,
      remark: guest.specialAssistanceRemark,
    },
  };
  if (sizePreference) {
    let sizeName = sizePreference.sizeName;
    preferences.size = {
      name: sizeName,
      preference: guest.sizePreference,
      remark: guest.sizePreferenceRemark,
    };
  }
  let transportBookings = TransportBookings.find({
    guestId: guest._id,
  }).fetch();
  let vehicleIds = [];
  let driverIds = [];
  transportBookings.forEach((tr) => {
    vehicleIds.push(tr.vehicleId);
    driverIds.push(tr.driverId);
  });

  let vehicles = TransportVehicles.find({ _id: { $in: vehicleIds } }).fetch();
  let drivers = TransportDrivers.find({ _id: { $in: driverIds } }).fetch();

  let hospitalityManagers = HospitalityManager.find({
    eventId: guest.eventId,
  }).fetch();
  let transportManagers = AirportManager.find({
    eventId: guest.eventId,
  }).fetch();
  return {
    _id: guest._id,
    name: guest.guestFirstName,
    flights,
    hotelBookings,
    hotels,
    visa,
    preferences,
    transportBookings,
    airports,
    airlines,
    vehicles,
    drivers,
    hospitalityManagers,
    transportManagers,
    services,
    serviceBookings,
    roomSharer,
    roomSharerName,
  };
}

function getRSVPInfo(guests, event, rsvps, subevents) {
  var val = guests.map((guest) => {
    return getRSVPInfoFromGuest(guest, event, rsvps, subevents);
  });

  return val;
}

function getRSVPInfoFromGuest(guest, event, rsvps, subevents) {
  return {
    guestId: guest._id,
    name: guest.guestFirstName,
    guestIsPrimary: guest.guestIsPrimary,
    rsvpInfo: getSubEventsList(guest, event, rsvps, subevents),
  };
}

function getSubEventsList(guest, event, rsvpObj, subevents) {
  return subevents.map((ev) => {
    let rsvp = RSVP.findOne({
      guestId: guest._id,
      subEventId: ev._id,
    });

    return {
      ...ev,
      status: rsvp ? rsvp.status : "Maybe",
    };
  });

  // let sortingType = event.basicDetails.eventSubeventSorting;

  // let val = [];
  // let subeventArray = subevents.fetch();
  // let rsvps = rsvpObj.fetch();
  // switch(sortingType) {
  // case SubEventSortingTypes.subevent:
  //   val =  getSubEvents(subeventArray, rsvps);
  //   break;
  // case SubEventSortingTypes.date:
  //   val = getSubEventsByDate(subeventArray, rsvps);
  //   break;
  // case SubEventSortingTypes.destination:
  //   val = getSubEventsByDestination(subeventArray, rsvps);
  //   break;
  // default:
  //   break;
  // }
  // return val;
}

const getSubEvents = (subs, rsvps) => {
  return _.map(subs, (s) => {
    let rsvp = _.find(rsvps, (r) => {
      return r.subEventId === s._id;
    });
    if (rsvp) {
      rsvp = rsvp.status;
    } else {
      rsvp = null;
    }
    return {
      subEventTitle: s.subEventTitle,
      subEventId: s._id,
      status: rsvp,
    };
  });
};

const getSubEventsByDate = (subs, rsvps) => {
  let dates = _.groupBy(subs, "subEventDate");
  let events = _.map(dates, (s, d) => {
    let ids = _.map(s, "_id");
    let statuses = _.map(ids, (id) => {
      let rsvp = _.find(rsvps, (r) => {
        return r.subEventId === id;
      });
      if (rsvp) {
        return rsvp.status;
      } else {
        return null;
      }
    });
    let status = null;
    if (statuses.length > 0) {
      let unique = !!statuses.reduce(function (a, b) {
        return a === b ? a : NaN;
      });
      if (unique) {
        status = statuses[0];
      }
    }
    return {
      subEventTitle: d,
      subEventId: _.join(ids, ","),
      status: status,
    };
  });
  return events;
};

const getSubEventsByDestination = (subs, rsvps) => {
  let destinations = _.groupBy(subs, "subEventLocation");
  let events = _.map(destinations, (s, d) => {
    let ids = _.map(s, "_id");
    let statuses = _.map(ids, (id) => {
      let rsvp = _.find(rsvps, (r) => {
        return r.subEventId === id;
      });
      if (rsvp) {
        return rsvp.status;
      } else {
        return null;
      }
    });
    let status = null;
    if (statuses.length > 0) {
      let unique = !!statuses.reduce(function (a, b) {
        return a === b ? a : NaN;
      });
      if (typeof unique === "boolean") {
        status = statuses[0];
      }
    }
    return {
      subEventTitle: d,
      subEventId: _.join(ids, ","),
      status: status,
    };
  });
  return events;
};

export const SubEventSortingDisplayName = {
  subevent: "Sub-event",
  date: "Date",
  destination: "Destination",
};

function activityRecordInsert(data) {
  var activityEvent = "";
  var activityEventId = "";
  var guest = Guests.findOne(data.guestId);
  var activityUserInfo = {
    id: guest && guest._id ? guest._id : "",
    name:
      guest && guest.guestFirstName
        ? guest.guestFirstName + " " + guest.guestLastName
        : "",
    email: guest && guest.guestPersonalEmail ? guest.guestPersonalEmail : "",
  };
  if (
    typeof guest.eventId == "undefined" ||
    guest.eventId == null ||
    guest.eventId == ""
  ) {
    activityEvent = "general";
    activityEventId = "general";
  } else {
    var event = Events.findOne(guest.eventId);
    activityEvent = event.basicDetails.eventName;
    activityEventId = event._id;
  }
  var date = new Date();
  userdata = {
    activityeDateTime: date,
    activityGuestInfo: activityUserInfo,
    activityModule: data.activityModule, //
    activitySubModule: data.activitySubModule, //
    activityEvent: activityEvent,
    activityEventId: activityEventId,
    activityMessage: data.activityMessage, //
  };
  insertPwaActivity.call(userdata, (err, res) => {
    if (err) {
      // console.log('PWA Tracker not insert' + err);
      return 0;
    } else {
      return true;
    }
  });
}
