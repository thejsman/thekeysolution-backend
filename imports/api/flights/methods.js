import { Meteor } from 'meteor/meteor';
import { HTTP } from 'meteor/http';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Events } from '../events/events.js';
import { Airports } from '../airports/airports'
import { Roles } from 'meteor/meteor-roles';
import { Flights } from './flights.js';
import { Guests } from '../guests/guests'
import { FlightBookings } from './flightBookings.js';
import { FlightSchema, FlightBookingSchema } from './schema.js';
import { insertActivity } from '../../api/activity_record/methods.js';
import _ from 'lodash';
import moment from 'moment';

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

function getAirportId(abc) {
  let airport = Airports.findOne({
    airportIATA: abc
  });
  return airport._id;
}

//code to insert data in Activity Record
function activityRecordInsert(data) {
  var activityEvent = ''
  var activityUserInfo = {
    id: Meteor.userId(),
    name: Meteor.user().profile.name,
    email: Meteor.user().emails[0].address,
  }
  if (data.eventId == null || data.eventId == '' || data.eventId == undefined) {
    activityEvent = 'general';
  }
  else {
    var event = Events.findOne(data.eventId);
    activityEvent = event.basicDetails.eventName;
  }
  var date = new Date();
  userdata = {
    activityeDateTime: date, //date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+'.'+date.getMilliseconds(),
    activityUserInfo: activityUserInfo,
    activityModule: data.activityModule,
    activitySubModule: data.activitySubModule,
    activityEvent: activityEvent,
    activityMessage: data.activityMessage,

  }
  insertActivity.call(userdata, (err, res) => {
    if (err) {
      return 0;
    }
    else {
      return true;
    }
  });
};

export const insertFlight = new ValidatedMethod({
  name: "Flights.methods.insert",
  validate: FlightSchema.validator({ clean: true }),
  run(newFlight) {
    var event = Events.findOne({
      _id: newFlight.eventId
    });

    if (event) {
      var isGroup = newFlight.flightIsGroupPNR;
      var totalSeatCount = newFlight.flightTotalSeats;
      if (isGroup) {
        totalSeatCount = 1;
      }
      if (newFlight.flightPNRs.length !== totalSeatCount) {
        throw new Meteor.Error("PNR and seat mismatch");
      }
      Flights.insert(newFlight);

      //code to insert data in Activity Record

      activityInsertData = {
        eventId: newFlight.eventId,
        activityModule: 'Flight',
        activitySubModule: 'Flight',
        event: 'add',
        activityMessage: 'Flight is added for event.'

      }
      if(Meteor.userId()) {
        activityRecordInsert(activityInsertData);
      }
    }
    else {
      throw new Meteor.Error("Event id invalid");
    }
  }
});

export const updateFlight = new ValidatedMethod({
  name: "Flights.methods.update",
  validate: FlightSchema.validator({ clean: true }),
  run(updateFlight) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, 'edit-flights')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    var event = Events.findOne({
      _id: updateFlight.eventId
    });

    if (event) {
      var isGroup = updateFlight.flightIsGroupPNR;
      var totalSeatCount = updateFlight.flightTotalSeats;
      if (isGroup) {
        totalSeatCount = 1;
      }
      if (updateFlight.flightPNRs.length !== totalSeatCount) {
        throw new Meteor.Error("PNR and seat mismatch");
      }
      Flights.update(updateFlight.flightId, {
        $set: updateFlight
      });
    }
    else {
      throw new Meteor.Error("Event id invalid");
    }
  }
});


export const deleteFlight = new ValidatedMethod({
  name: "Flights.methods.delete",
  validate: null,
  run(flightId) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, 'delete-flights')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    Flights.remove(flightId);
    FlightBookings.remove({ flightId });
  }
});


export const PersonalbookFlight = new ValidatedMethod({
  name: "PersonalFlightBookings.methods.insert",
  validate: FlightBookingSchema.validator(),
  run(booking) {
    var eventId = booking.eventId;
    var event = Events.findOne({
      _id: eventId
    });
    var guest = Guests.findOne({
      _id: booking.guestId
    });
    if (event && guest) {
      var alreadyBooked = FlightBookings.findOne({
        eventId: eventId,
        guestId: booking.guestId,
        flightId: booking.flightId
      });
      if (alreadyBooked && booking.agencyProvided == true) {
        throw new Meteor.Error("Flight Already booked for " + guest.guestFirstName + ' ' + guest.guestLastName);
      }
      else {
        FlightBookings.insert(booking);
        //code for activity record
        activityInsertData = {
          eventId: eventId,
          activityModule: 'Guests',
          activitySubModule: 'Flights',
          event: 'add',
          activityMessage: 'Flight is booked by' + guest.guestTitle + ' ' + guest.guestFirstName + ' ' + guest.guestLastName + '.'
        }
        if(Meteor.userId()){
          activityRecordInsert(activityInsertData);
        }
      }
    }
    else {
      throw new Meteor.Error("Invalid data result");
    }
  }
});

export const PersonalRemoveFlightBooking = new ValidatedMethod({
  name: "FlightBookings.Remove",
  validate: null,
  run(bookingId) {
    // ABL_SAM added Permission Check
    // console.log("User IDD", this.userId);
    // if (!isAllowed(this.userId, 'delete-flight-booking')) {
    //   throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    // }
    let flights = FlightBookings.findOne(bookingId);
    let guests = Guests.findOne(flights.guestId);
    FlightBookings.remove(bookingId);
    //code for activity record

    activityInsertData = {
      eventId: guests.eventId,
      activityModule: 'Guests',
      activitySubModule: 'Flights',
      event: 'delete',
      activityMessage: 'Flight booking for ' + guests.guestTitle + ' ' + guests.guestFirstName + ' ' + guests.guestLastName + ' is canceled.'
    }
    activityRecordInsert(activityInsertData);


  }
});


export const bookFlight = new ValidatedMethod({
  name: "FlightBookings.methods.insert",
  validate: FlightBookingSchema.validator({ clean: true }),
  run(booking) {
    var eventId = booking.eventId;
    var flightId = booking.flightId;

    var event = Events.findOne({
      _id: eventId
    });
    var flight = Flights.findOne({
      _id: flightId,
      flightPNRs: booking.pnrNumber
    });

    var guest = Guests.findOne({
      _id: booking.guestId
    });
    if (event && flight && guest) {
      var alreadyBooked = FlightBookings.findOne({
        eventId: eventId,
        guestId: booking.guestId,
        flightId: flightId
      });
      if (getAvailableSeats({ eventId, flightId }) < 1) {
        throw new Meteor.Error("Flight full");
      }
      else if (alreadyBooked) {
        throw new Meteor.Error("Already booked");
      }
      else {
        FlightBookings.insert(booking);

        //code for activity record
        let guests = Guests.findOne(booking.guestId);

        GiftBookings.remove(bookingId);

        activityInsertData = {
          eventId: eventId,
          activityModule: 'Guests',
          activitySubModule: 'Flight',
          event: 'add',
          activityMessage: 'Flight is booked for ' + guests.guestTitle + ' ' + guests.guestFirstName + ' ' + guests.guestLastName + '.'
        }
        activityRecordInsert(activityInsertData);

      }
    }
    else {
      throw new Meteor.Error("Invalid data");
    }
  }
});

export const getAvailableFlights = new ValidatedMethod({
  name: "Flight.methods.getAvailable",
  validate: null,
  run(data) {
    return getAvailableSeats(data);
  }
});

function getAvailableSeats({ eventId, flightId }) {
  var flight = Flights.findOne({
    _id: flightId

  });
  if (flight) {
    var bookings = FlightBookings.find({
      eventId: eventId,
      flightId: flightId
    });
    return flight.flightTotalSeats - bookings.count();
  }
  else {
    return 0;
  }
}

// Search Flight

export const searchFlightByServer = (data) => {
  let options = {
    'headers': {
      'Access-Control-Allow-Origin': 'https://api.flightstats.com/'
    }
  };
  let url = `https://api.flightstats.com/flex/schedules/rest/v1/json/flight/${data.airlineCode}/${data.flightNo}/departing/${data.date}?appId=9aec5eee&appKey=11a210ec25691cfa402e6dfc2e9f9b65`;
  var convertAsyncToSync = Meteor.wrapAsync(HTTP.get),
    resultOfAsyncToSync = convertAsyncToSync(url, options);
  return resultOfAsyncToSync;
}

export const searchFlight = new ValidatedMethod({
  name: "Flight.methods.search",
  validate: null,
  run(data) {
    return searchFlightByServer(data);
  }
});

// All active airlines
export const allAirline = new ValidatedMethod({
  name: "Flight.methods.airlines",
  validate: null,
  run() {
    let options = {
      'headers': {
        'Access-Control-Allow-Origin': 'https://api.flightstats.com/'
      }
    };
    let url = `https://api.flightstats.com/flex/airlines/rest/v1/json/active?appId=9aec5eee&appKey=11a210ec25691cfa402e6dfc2e9f9b65`;
    var convertAsyncToSync = Meteor.wrapAsync(HTTP.get),
      resultOfAsyncToSync = convertAsyncToSync(url, options);
    return resultOfAsyncToSync;
  }
});

function getGuestId(abc, eventId) {
  let guest = Guests.findOne({
    folioNumber: Number(abc),
    eventId: eventId
  });
  if (guest) {
    return guest._id;
  } else {
    return 'null';
  }
}

function getFlightId(abc, eventId) {
  let flight = Flights.findOne({
    flightPNRs: abc,
    eventId: eventId
  });
  if (flight) {
    return flight._id;
  } else {
    return false;
  }
}

export const findGuest = (eventId, guestFolio) => {
  return Guests.find({ eventId: eventId });
};

export const uploadFlightExcel = new ValidatedMethod({
  name: "PersonalFlightBookings.methods.upload",
  validate: null,
  run(booking) {
    if (Meteor.isServer) {
      var eventId = booking.eventId;
      let data = _.values(booking.bookingdata);
      let folioNos = _.map(data, 'Folio No');
      let errMsg = [];
      let sucessMsg = [];
      for (let i = 0; data.length > i; i++) {
        let fNo = data[i]['Folio No']
        let pnr = data[i]['PNR No']
        let guestId = getGuestId(fNo, eventId)
        let flightId = getFlightId(pnr, eventId);
        let aval = getAvailableSeats({ eventId, flightId });
        if (guestId && flightId && (aval > 0)) {
          let dta = {
            eventId: eventId,
            flightId: flightId,
            pnrNumber: pnr,
            agencyProvided: true,
            guestId: guestId
          }
          FlightBookings.insert(dta);
          sucessMsg.push("<p class='flight-upload-success'>Successfully booked the Flight for for Guest with Folio No :: " + data[i]['Folio No'] + '</p>')
        } else {
          if (aval < 0) {
            errMsg.push("<p class='flight-upload-error'>Seat Not available on PNR :: " + data[i]['PNR No'] + '</p>');
          } else if (!guestId) {
            errMsg.push("<p class='flight-upload-error'>Guest not found for Folio Number :: " + data[i]['Folio No'] + '</p>')
          } else if (!flightId) {
            errMsg.push("<p class='flight-upload-error'>Flight not found for PNR :: " + data[i]['PNR No'] + '</p>')
          } else {
            errMsg.push("<p class='flight-upload-error'>Error while booking the flight for the Guest Folio- " + data[i]['Folio No'] + ', PNR: ' + data[i]['PNR No'] + '</p>')
          }
        }
      }
      errMsg = errMsg.concat(sucessMsg);
      return errMsg;
    }
  }
});

export const uploadFlightExcelIndividual = new ValidatedMethod({
  name : 'PersonalFlightBookings.methods.invidualUpload',
  validate : null,
  run (data){
    let eventId = data.eventId;
    let flightUploadErrorList = [];
    data.bookingdata.map(a => {
      // console.log('dataaaaasaa ::', a)
      let guestId = getGuestId(a.FolioNo, eventId)
      let flightLegs = []
      // LEG 1
      if(a.Leg1FlightNo && a.Leg1AirlineCode && a.Leg1DepDate && a.Leg1DepCity && a.Leg1DepTime && a.Leg1ArrCity){
        let legDepTime = moment(a.Leg1DepDate + ' ' + a.Leg1DepTime).format('YYYY-MM-DDTHH:mm:00.000');
        let legArrTime = moment(a.Leg1ArrDate + ' ' + a.Leg1ArrTime).format('YYYY-MM-DDTHH:mm:00.000');
        let depCity = (a.Leg1DepCity.trim()).toUpperCase();
        let arrCity = (a.Leg1ArrCity.trim()).toUpperCase();
        let legAirCode = (a.Leg1AirlineCode.trim()).toUpperCase();
        flightLegs.push({
          airlineIATA : legAirCode,
          flightDepartureCityId: getAirportId(depCity),
          flightDepartureTime: legDepTime,
          flightArrivalCityId : getAirportId(arrCity),
          flightArrivalTime : legArrTime,
          flightNo : a.Leg1FlightNo,
          pnr : a.Leg1PNR,
          class : a.Leg1Class,
        })
        
      }
      // LEG 2
      if(a.Leg2FlightNo && a.Leg2AirlineCode && a.Leg2DepDate && a.Leg2DepCity && a.Leg2DepTime && a.Leg2ArrCity){
        let legDepTime = moment(a.Leg2DepDate + ' ' + a.Leg2DepTime).format('YYYY-MM-DDTHH:mm:00.000');
        let legArrTime = moment(a.Leg2ArrDate + ' ' + a.Leg2ArrTime).format('YYYY-MM-DDTHH:mm:00.000');
        let depCity = (a.Leg2DepCity.trim()).toUpperCase();
        let arrCity = (a.Leg2ArrCity.trim()).toUpperCase();
        let legAirCode = (a.Leg2AirlineCode.trim()).toUpperCase();
        flightLegs.push({
          airlineIATA : legAirCode,
          flightDepartureCityId: getAirportId(depCity),
          flightDepartureTime: legDepTime,
          flightArrivalCityId : getAirportId(arrCity),
          flightArrivalTime : legArrTime,
          flightNo : a.Leg2FlightNo,
          pnr : a.Leg2PNR,
          class : a.Leg2Class,
        })
      }
      // LEG 3
      if(a.Leg3FlightNo && a.Leg3AirlineCode && a.Leg3DepDate && a.Leg3DepCity && a.Leg3DepTime && a.Leg3ArrCity){
        let legDepTime = moment(a.Leg3DepDate + ' ' + a.Leg3DepTime).format('YYYY-MM-DDTHH:mm:00.000');
        let legArrTime = moment(a.Leg3ArrDate + ' ' + a.Leg3ArrTime).format('YYYY-MM-DDTHH:mm:00.000');
        let depCity = (a.Leg3DepCity.trim()).toUpperCase();
        let arrCity = (a.Leg3ArrCity.trim()).toUpperCase();
        let legAirCode = (a.Leg3AirlineCode.trim()).toUpperCase();
        flightLegs.push({
          airlineIATA : legAirCode,
          flightDepartureCityId: getAirportId(depCity),
          flightDepartureTime: legDepTime,
          flightArrivalCityId : getAirportId(arrCity),
          flightArrivalTime : legArrTime,
          flightNo : a.Leg3FlightNo,
          pnr : a.Leg3PNR,
          class : a.Leg3Class,
        })
      }
      // LEG 4
      if(a.Leg4FlightNo && a.Leg4AirlineCode && a.Leg4DepDate && a.Leg4DepCity && a.Leg4DepTime && a.Leg4ArrCity){
        let legDepTime = moment(a.Leg4DepDate + ' ' + a.Leg4DepTime).format('YYYY-MM-DDTHH:mm:00.000');
        let legArrTime = moment(a.Leg4ArrDate + ' ' + a.Leg4ArrTime).format('YYYY-MM-DDTHH:mm:00.000');
        let depCity = (a.Leg4DepCity.trim()).toUpperCase();
        let arrCity = (a.Leg4ArrCity.trim()).toUpperCase();
        let legAirCode = (a.Leg4AirlineCode.trim()).toUpperCase();
        flightLegs.push({
          airlineIATA : legAirCode,
          flightDepartureCityId: getAirportId(depCity),
          flightDepartureTime: legDepTime,
          flightArrivalCityId : getAirportId(arrCity),
          flightArrivalTime : legArrTime,
          flightNo : a.Leg4FlightNo,
          pnr : a.Leg4PNR,
          class : a.Leg4Class,
        })
      }
      // LEG 5
      if(a.Leg5FlightNo && a.Leg5AirlineCode && a.Leg5DepDate && a.Leg5DepCity && a.Leg5DepTime && a.Leg5ArrCity){
        let legDepTime = moment(a.Leg5DepDate + ' ' + a.Leg5DepTime).format('YYYY-MM-DDTHH:mm:00.000');
        let legArrTime = moment(a.Leg5ArrDate + ' ' + a.Leg5ArrTime).format('YYYY-MM-DDTHH:mm:00.000');
        let depCity = (a.Leg5DepCity.trim()).toUpperCase();
        let arrCity = (a.Leg5ArrCity.trim()).toUpperCase();
        let legAirCode = (a.Leg5AirlineCode.trim()).toUpperCase();
        flightLegs.push({
          airlineIATA : legAirCode,
          flightDepartureCityId: getAirportId(depCity),
          flightDepartureTime: legDepTime,
          flightArrivalCityId : getAirportId(arrCity),
          flightArrivalTime : legArrTime,
          flightNo : a.Leg5FlightNo,
          pnr : a.Leg5PNR,
          class : a.Leg5Class,
        })
      }


      // LEG 6
      if(a.Leg6FlightNo && a.Leg6AirlineCode && a.Leg6DepDate && a.Leg6DepCity && a.Leg6DepTime && a.Leg6ArrCity){
        let legDepTime = moment(a.Leg6DepDate + ' ' + a.Leg6DepTime).format('YYYY-MM-DDTHH:mm:00.000');
        let legArrTime = moment(a.Leg6ArrDate + ' ' + a.Leg6ArrTime).format('YYYY-MM-DDTHH:mm:00.000');
        let depCity = (a.Leg6DepCity.trim()).toUpperCase();
        let arrCity = (a.Leg6ArrCity.trim()).toUpperCase();
        let legAirCode = (a.Leg6AirlineCode.trim()).toUpperCase();
        flightLegs.push({
          airlineIATA : legAirCode,
          flightDepartureCityId: getAirportId(depCity),
          flightDepartureTime: legDepTime,
          flightArrivalCityId : getAirportId(arrCity),
          flightArrivalTime : legArrTime,
          flightNo : a.Leg6FlightNo,
          pnr : a.Leg6PNR,
          class : a.Leg6Class,
        })
      }

      let guestdata = {
        agencyProvided : false,
        eventId : eventId,
        guestId : guestId,
        flightLegs : flightLegs,
      }
      
      if(guestdata.flightLegs.length < 1){
        flightUploadErrorList.push(`Folio No ${a.FolioNo} :: Minimum one valid leg required, please check all the leg data.`);
      } else if(guestdata.guestId == 'null' || guestdata.guestId == undefined || !guestdata.guestId){
          flightUploadErrorList.push(`Folio No ${a.FolioNo} :: Guest Not Found for Folio Number ${a.FolioNo}.`);
      } else {
        FlightBookings.insert(guestdata);
        console.log(`Folio No ${a.FolioNo} :: Flight Added Sucessfully.`, guestdata);
      }
    })
    return flightUploadErrorList;
  }
});