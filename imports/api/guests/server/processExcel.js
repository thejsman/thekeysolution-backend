import XLSX from 'xlsx';
import { Meteor } from 'meteor/meteor';
import { Airports } from '../../airports/airports.js';
import { Airlines } from '../../airlines/airlines.js';
import { Flights } from '../../flights/flights.js';
import { FileGuestSchema } from './fileUploadGuestSchema.js';
import { IncrementGuestCount } from '../guestUtils.js';
import { Guests } from '../guests.js';
import { Events } from '../../events/events.js';
import { Hotels } from '../../hotels/hotels.js';
import { Rooms } from '../../hotels/rooms.js';
import { Insurances } from '../../insurances/insurances.js';
import { Passports } from '../../passports/passports.js';
import { Visas } from '../../visas/visas.js';
import { Gifts } from '../../gifts/gifts.js';
import { RSVP } from '../../rsvp/rsvp.js';
import { SubEvents } from '../../subevents/subevents.js';
import { FlightBookings } from '../../flights/flightBookings.js';
import { HotelBookings } from '../../hotels/hotelBookings.js';
import { GiftBookings } from '../../gifts/giftBooking.js';
import { TransportBookings } from '../../transport/transportbookings.js';
import { ServiceBookings } from '../../services/serviceBooking.js';
import { TransportDrivers } from '../../transport/transport_drivers.js';
import { TransportVehicles } from '../../transport/transport_vehicles.js';
import { Services } from '../../services/services.js';
import { serviceBookings } from '../../services/serviceBooking.js';
import { SubEventSortingTypes } from '../../events/subEventSortingTypes.js';
import { HotelforsaleBookings } from '../../hotelsforsale/hotelforsaleBookings.js';//new Added ROC
import { Hotelsforsale } from '../../hotelsforsale/hotelsforsale.js';
import { FlightforsaleBookings } from '../../flightsforsale/flightforsaleBookings.js';
import { Flightsforsale } from '../../flightsforsale/flightsforsale.js';
import _ from 'lodash';
import moment from 'moment';


let transformGuest = (guest) => {

  return {
    guestTitle: guest['Title'],
    guestFirstName: guest['First Name'],
    guestLastName: guest['Last Name'],
    guestFamilyID: guest['Family ID'],
    guestIsPrimary: (guest['Is Primary'] == "1" || guest['Is Primary'] == true || guest['Is Primary'] == "TRUE" || guest['Is Primary'] == "PRIMARY" || guest['Is Primary'] == "primary" || guest['Is Primary'] == "Primary"),
    guestAddressing: guest['Nickname'],
    guestDOB: guest['Date of birth'],
    guestInviteSent : false,
    guestGender: ((guest['Gender'] == 'm' || guest['Gender'] == 'M' || guest['Gender'] == 'male' || guest['Gender'] == 'Male' || guest['Gender'] == 'MALE') ? "male" : (guest['Gender'] == 'f' || guest['Gender'] == 'F' || guest['Gender'] == 'female' || guest['Gender'] == 'Female' || guest['Gender'] == 'FEMALE') ? "female" : (guest['Gender'] == 'c' || guest['Gender'] == 'C' || guest['Gender'] == 'child' || guest['Gender'] == 'Child' || guest['Gender'] == 'CHILD') ? 'chiild' : ''),
    guestPersonalEmail: guest['Primary Email'],
    guestPhoneCode: guest['Country Code'],
    guestContactNo: guest['Contact Number'],
    guestAddress1: guest['Address Line 1'],
    guestAddress2: guest['Address Line 2'],
    guestAddressCity: guest['City'],
    guestAddressState: guest['State'],
    guestAddressPincode: guest['Pincode'],
    guestAddressNationality: guest['Country'],
    guestAddressLandmark: guest['Landmark'],
    guestNearestAirport: guest['Nearest Airport'],
    guestSecretaryName: guest['Secretary Name'],
    guestSecretaryEmail: guest['Secretary Email'],
    guestSecretaryContactNo: guest['Secretary Contact'],
    guestRemarks: guest['Remark'],
    freeHotelRoom: guest['freeHotelRoom'],
    freeFlightTicket: guest['freeFlightTicket']
  };
};

let createGuest = (guest, eventId, invitelist) => {
  let guestNew = {
    folioNumber: IncrementGuestCount(eventId),
    eventId: eventId,
    accessCode: Math.floor(1000 + Math.random() * 9000).toString(),
    ...transformGuest(guest)
  };
  let subevents = SubEvents.find({ eventId: guestNew.eventId }).fetch();
  let seList = [];
  seList = subevents.map(a => {
    if (_.includes(invitelist, a._id)) {
      return {
        subEventId: a._id,
        status: true
      }
    } else {
      return {
        subEventId: a._id,
        status: false
      }
    }
  });
  guestNew.guestPersonalEmail = (guestNew.guestPersonalEmail.toLowerCase()).trim();
  guestNew.inviteStatus = seList;
  Guests.insert(guestNew);
};


let validateGuest = (guest) => {
  let validationContext = FileGuestSchema.newContext();
  validationContext.validate(guest, { clean: true });
  if (validationContext.isValid()) {
    return true;
  }
  else {
    return false;
  }
};


export const updateGuestsFromExcel = (data, name, eventId, invitelist) => {
  // console.log('File to be processed ::', data)
  // let wb = XLSX.read(data, { type: 'binary' });
  let f = data;
  let event = Events.findOne(eventId);
  let family_grouping = {};
  let new_guest_list = [];

  let DoBOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  let freeFlight = true;
  let freeHotel = true;
  if (!event) {
    throw new Meteor.Error("Invalid Event");
  }
  if (event.featureDetails && event.featureDetails.selectedFeatures && event.featureDetails.selectedFeatures.indexOf('Flight Booking') > -1 && event.featureDetails.selectedFeatures.indexOf('Flight Booking Paid') > -1) {
    freeFlight = true;
  } else if (event.featureDetails && event.featureDetails.selectedFeatures && event.featureDetails.selectedFeatures.indexOf('Flight Booking') > -1 && event.featureDetails.selectedFeatures.indexOf('Flight Booking Paid') == -1) {
    freeFlight = true;
  } else if (event.featureDetails && event.featureDetails.selectedFeatures && event.featureDetails.selectedFeatures.indexOf('Flight Booking') == -1 && event.featureDetails.selectedFeatures.indexOf('Flight Booking Paid') > -1) {
    freeFlight = false;
  }
  if (event.featureDetails && event.featureDetails.selectedFeatures && event.featureDetails.selectedFeatures.indexOf('Hotel Booking') > -1 && event.featureDetails.selectedFeatures.indexOf('Hotel Booking Paid') > -1) {
    freeHotel = true;
  } else if (event.featureDetails && event.featureDetails.selectedFeatures && event.featureDetails.selectedFeatures.indexOf('Hotel Booking') > -1 && event.featureDetails.selectedFeatures.indexOf('Hotel Booking Paid') == -1) {
    freeHotel = true;
  } else if (event.featureDetails && event.featureDetails.selectedFeatures && event.featureDetails.selectedFeatures.indexOf('Hotel Booking') == -1 && event.featureDetails.selectedFeatures.indexOf('Hotel Booking Paid') > -1) {
    freeHotel = false;
  }

  for (var i = 0; i < f.length; i++) {
    let guest = f[i];
    let family_id = guest['Family ID'];
    if (guest['Date of birth'] != undefined) {
      // let DoB = new Date(guest['Date of birth']);
      // console.log("DOB not mentioned", DoB.toLocaleDateString('en-UK', DoBOptions));
      // guest['Date of birth'] = DoB.toLocaleDateString('en-UK', DoBOptions);
    }

    if (family_grouping.hasOwnProperty(family_id)) {

      family_grouping[family_id].push(guest)
    } else {

      family_grouping[family_id] = [];
      family_grouping[family_id].push(guest)
    }
  }

  for (var key in family_grouping) {
    var count = 0;
    let alreadyFamilyID = Guests.findOne({
      guestFamilyID: key,
      guestIsPrimary: true,
      eventId: eventId
    });


    family_grouping[key].forEach((booking, index) => {


      if (booking['Is Primary'] == "1" || booking['Is Primary'] == true || booking['Is Primary'] == "TRUE" || booking['Is Primary'] == "PRIMARY" || booking['Is Primary'] == "primary" || booking['Is Primary'] == "Primary") {
        count++;
      }
    })

    if (((count == 0) && (alreadyFamilyID)) || ((count == 1) && (!alreadyFamilyID))) {
      //
      family_grouping[key] = _.sortBy(family_grouping[key], ['Is Primary']);  //sort
      // console.log('sortedObjs', family_grouping[key]);

      family_grouping[key].forEach((booking, index) => {
        if (booking['Primary Email'] == undefined) {

          let primaryEmail = Guests.findOne({
            guestFamilyID: booking['Family ID'],
            guestIsPrimary: true,
            eventId: eventId
          });
          booking['Primary Email'] = primaryEmail['guestPersonalEmail'];
        }
        let alreadyExists = Guests.findOne({
          guestPersonalEmail: booking['Primary Email'],
          eventId: eventId
        });

        if (alreadyExists) {
          if (booking['Is Primary'] == "1" || booking['Is Primary'] == true || booking['Is Primary'] == "TRUE" || booking['Is Primary'] == "PRIMARY" || booking['Is Primary'] == "primary" || booking['Is Primary'] == "Primary") {
            booking['Uploaded'] = 'FALSE';
            booking['Error'] = 'Guest with this mail id already exist..'
          } else {
            let em = booking['Primary Email'].split('@');
            var count = IncrementGuestCount(eventId);
            let f = Array(5 - String(count).length + 1).join('0') + count;
            booking['Primary Email'] = em[0] + '+family' + f + '@' + em[1];
            let validGuest = validateGuest(booking);
            if (validGuest == true) {
              let guestNew = {
                folioNumber: count,
                eventId: eventId,
                accessCode: Math.floor(1000 + Math.random() * 9000).toString(),
                ...transformGuest(booking)
              };
              if (invitelist) {
                let subevents = SubEvents.find({ eventId: guestNew.eventId }).fetch();
                let seList = [];
                seList = subevents.map(a => {
                  if (_.includes(invitelist, a._id)) {
                    return {
                      subEventId: a._id,
                      status: true
                    }
                  } else {
                    return {
                      subEventId: a._id,
                      status: false
                    }
                  }
                });
                guestNew.inviteStatus = seList;
              }
              Guests.insert(guestNew);
              //createGuest(booking, eventId);
              booking['Uploaded'] = 'TRUE';
              booking['Error'] = '';
            }
            else {
              booking['Uploaded'] = 'FALSE';
              booking['Error'] = 'data for this guest is not in valid format.'
            }
          }

        } else {
          let validGuest = validateGuest(booking);
          if (validGuest == true) {
            // CODE TO SET FREE OR PAID FLAGS
            booking.freeHotelRoom = freeHotel;
            booking.freeFlightTicket = freeFlight;
            createGuest(booking, eventId, invitelist);
            booking['Uploaded'] = 'TRUE';
            booking['Error'] = '';
          }
          else {
            booking['Uploaded'] = 'FALSE';
            booking['Error'] = 'data for this guest is not in valid format.'
          }
        }


        new_guest_list.push(booking);
      })

    } else {

      family_grouping[key].forEach((booking, index) => {
        booking['Uploaded'] = 'FALSE';
        if (count >= 2) {
          booking['Error'] = 'Sheet consists of more then 2 primary member of same family.'
        }
        else if ((count == 1) && (alreadyFamilyID)) {
          booking['Error'] = 'Sheet and database both consists of primary member for same family.'
        } else if ((count == 0) && (!alreadyFamilyID)) {
          booking['Error'] = 'This guest dont have any primary member either in sheet or in database.'
        } else {
          booking['Error'] = 'Some unknown error.'
        }
        new_guest_list.push(booking);
      })
    }
  }
  const ws = XLSX.utils.json_to_sheet(new_guest_list);
  const wb1 = { SheetNames: ["Sheet1"], Sheets: { Sheet1: ws } };
  return wb1;
};

export const getGuestsSampleExcel = () => {
  let guestList = [{
    'Title': '',
    'First Name': '',
    'Last Name': '',
    'Family ID': '',
    'Is Primary': '',
    'Nickname': '',
    'Date of Birth': '',
    'Gender': '',
    'Primary Email': '',
    'Contact Number': '',
    'Address Line 1': '',
    'Address Line 2': '',
    'City': '',
    'State': '',
    'Pincode': '',
    'Country': '',
    'Landmark': '',
    'Nearest Airport': '',
    'Secretary Name': '',
    'Secretary Email': '',
    'Secretary Contact': '',
    'Remark': '',
  }, {
    'Title': ''
  }, {
    'Title': "INSTRUCTIONS:This is sample format sheet which can be used to import guest via excel sheet."
  }];
  const ws = XLSX.utils.json_to_sheet(guestList);
  var wscols = [];
  var wsrows = [];

  ws['!cols'] = wscols;
  ws['!rows'] = wsrows;

  const wb = { SheetNames: ["Sheet1"], Sheets: { Sheet1: ws } };
  return wb;
}

//new changes made from here ROC
export const getGuestsExcel = (eventId, extraInfo) => {
  let event = Events.findOne(eventId);
  let guests = Guests.find({ eventId });
  let subEvents = SubEvents.find({ eventId });
  let sortingType = event.basicDetails.eventSubeventSorting;
  let guestList = [];

  guests.forEach(guest => {
    let guestId = guest._id;
    let flag = 0;
    // Not putting this one in, till we get data that can be exported in
    // a sane way
    let airport = Airports.findOne(guest.guestNearestAirport);

    let guestInfo = {
      ['Folio No']: guest.folioNumber,
      ['Family ID']: guest.guestFamilyID,
      ['Title']: guest.guestTitle,
      ['First Name']: guest.guestFirstName,
      ['Last Name']: guest.guestLastName,
      ['Is Primary']: guest.guestIsPrimary ? "Yes" : "No",
      ['How to address in the App']: guest.guestAddressing,
      ['Email']: guest.guestPersonalEmail,  //no field by name primar email
      ['Country Code'] : guest.guestPhoneCode,
      ['Mobile No']: guest.guestContactNo,
      ['Date of Birth']: guest.guestDOB,
      ['Gender']: guest.guestGender,  //pending
      // ['Address Line 1']: guest.guestAddress1,
      // ['Address Line 2']: guest.guestAddress2,
      // ['City']: guest.guestAddressCity,
      // ['State']: guest.guestAddressState,
      // ['Pincode']: guest.guestAddressPincode,
      // ['Country']: guest.guestAddressNationality,
      // ['Landmark']: guest.guestAddressLandmark,
      // ['Nearest Airport']: airport ? airport.airportName : '',
      // ['Secretary Name']: guest.guestSecretaryName,
      // ['Secretary Email']: guest.guestSecretaryEmail,
      // ['Secretary Contact No.']: guest.guestSecretaryContactNo,
      ['Remark']: guest.guestRemarks,
    };

    // Excel for Bulk Hotel upload
    if(extraInfo.hotel_bulk_upload) {
      guestInfo = {
        ["Folio No"]: guest.folioNumber,
        ["Family ID"]: guest.guestFamilyID,
        ["Guest Name"]: `${guest.guestTitle} ${guest.guestFirstName} ${guest.guestLastName}`,
        ["Email"]: guest.guestPersonalEmail,  //no field by name primar email
        ["Mobile No"]: `${guest.guestPhoneCode} ${guest.guestContactNo}`,
        ["Hotel Name"]: "",
        ["Room Category Type"]:"",     
        ["Bed Type"]:"",	
        ["Check-in Date"]:"",	
        ["Check-out Date"]:"",	
        ["Placeholder Room Number"]:"",	
        ["Display Room Number"]:"",	
        ["Room Remark"]:""
      };
    }
    // Excel for bulk flight upload
    if (extraInfo.flight_upload) {
      guestInfo = {
        ['Folio No']: guest.folioNumber,
        ['Family ID']: guest.guestFamilyID,
        ['Title']: guest.guestTitle,
        ['First Name']: guest.guestFirstName,
        ['Last Name']: guest.guestLastName,
        ['Email']: guest.guestPersonalEmail,  //no field by name primar email
        ['Mobile No']: guest.guestContactNo,
        ['PNR No']: '',
      };
    }

    // Excel for flight individual flight upload
    if (extraInfo.individual_flight_upload) {
      guestInfo = {
        ['FolioNo']: guest.folioNumber,
        ['Family ID']: guest.guestFamilyID,
        ['Title']: guest.guestTitle,
        ['First Name']: guest.guestFirstName,
        ['Last Name']: guest.guestLastName,
        ['Email']: guest.guestPersonalEmail,
        ['Mobile No']: guest.guestContactNo,
        ['Leg1DepCity']: '',
        ['Leg1ArrCity']: '',
        ['Leg1DepDate']: '',
        ['Leg1DepTime']: '',
        ['Leg1ArrDate']: '',
        ['Leg1ArrTime']: '',
        ['Leg1AirlineCode']: '',
        ['Leg1FlightNo']: '',
        ['Leg1Class']: '',
        ['Leg1PNR']: '',
        ['Leg2DepCity']: '',
        ['Leg2ArrCity']: '',
        ['Leg2DepDate']: '',
        ['Leg2DepTime']: '',
        ['Leg2ArrDate']: '',
        ['Leg2ArrTime']: '',
        ['Leg2AirlineCode']: '',
        ['Leg2FlightNo']: '',
        ['Leg2Class']: '',
        ['Leg2PNR']: '',
        ['Leg3DepCity']: '',
        ['Leg3ArrCity']: '',
        ['Leg3DepDate']: '',
        ['Leg3DepTime']: '',
        ['Leg3ArrDate']: '',
        ['Leg3ArrTime']: '',
        ['Leg3AirlineCode']: '',
        ['Leg3FlightNo']: '',
        ['Leg3Class']: '',
        ['Leg3PNR']: '',
        ['Leg4DepCity']: '',
        ['Leg4ArrCity']: '',
        ['Leg4DepDate']: '',
        ['Leg4DepTime']: '',
        ['Leg4ArrDate']: '',
        ['Leg4ArrTime']: '',
        ['Leg4AirlineCode']: '',
        ['Leg4FlightNo']: '',
        ['Leg4Class']: '',
        ['Leg4PNR']: '',
        ['Leg5DepCity']: '',
        ['Leg5ArrCity']: '',
        ['Leg5DepDate']: '',
        ['Leg5DepTime']: '',
        ['Leg5ArrDate']: '',
        ['Leg5ArrTime']: '',
        ['Leg5AirlineCode']: '',
        ['Leg5FlightNo']: '',
        ['Leg5Class']: '',
        ['Leg5PNR']: '',
        ['Leg6DepCity']: '',
        ['Leg6ArrCity']: '',
        ['Leg6DepDate']: '',
        ['Leg6DepTime']: '',
        ['Leg6ArrDate']: '',
        ['Leg6ArrTime']: '',
        ['Leg6AirlineCode']: '',
        ['Leg6FlightNo']: '',
        ['Leg6Class']: '',
        ['Leg6PNR']: ''
      };
    }

    /* RSVP Start */
    if (extraInfo.rsvp_info) {
      let rsvps = RSVP.find({ guestId, eventId: eventId });
      var final = [];
      switch (sortingType) {
        case SubEventSortingTypes.subevent: //subeventss

          subEvents.map(sb => {
            let st = {
              name: sb.subEventTitle,
              date: sb.subEventDate,
              location: sb.subEventLocation,
            };
            let rsvp = RSVP.find({
              guestId,
              subEventId: sb._id
            }).fetch();

            let sub = {};
            if (rsvp[0]) {
              if (rsvp[0].status === true) {
                sub = {
                  [st.name]: "Attending"
                };
              }
              else if (rsvp[0].status === false) {
                sub = {
                  [st.name]: "Regret"
                };
              }
            } else {
              sub = {
                [st.name]: "Maybe"
              };
            }
            guestInfo = Object.assign(guestInfo, sub);
          });
          break;
          rsvps.forEach((rsvp, index) => {

            var subevent = SubEvents.findOne(rsvp.subEventId);
            if (subevent && subevent.subEventDate) {
              if (rsvp.status == true) {
                sub = {
                  ['Date : ' + subevent.subEventDate]: "Attending"
                };
              }
              else if (rsvp.status == false) {
                sub = {
                  ['Date : ' + subevent.subEventDate]: "Regret"
                };
              }
            } else {
              sub = {
                ['Date : ' + subevent.subEventDate]: "Maybe"
              };
            }
            guestInfo = Object.assign(guestInfo, sub);
          })
          break;
        case SubEventSortingTypes.destination:
          rsvps.forEach((rsvp, index) => {
            var subevent = SubEvents.findOne(rsvp.subEventId);
            if (subevent && subevent.subEventDestination) {
              if (rsvp.status == true) {
                sub = {
                  ['Destination : ' + subevent.subEventDestination]: "Attending"
                };
              }
              else if (rsvp.status == false) {
                sub = {
                  ['Destination : ' + subevent.subEventDestination]: "Regret"
                };
              }
              else {
                sub = {
                  ['Destination : ' + subevent.subEventDestination]: "Maybe"
                };
              }
              guestInfo = Object.assign(guestInfo, sub);
            }
          })
          break;
      }
    }

    /* RSVP END */


    /* Detailed Guest Info Start */
    if (extraInfo.detailed_guest_info) {
      let detailed_info = {
        ['Address Line 1']: guest.guestAddress1,
        ['Address Line 2']: guest.guestAddress2,
        ['City']: guest.guestAddressCity,
        ['State']: guest.guestAddressState,
        ['Pincode']: guest.guestAddressPincode,
        ['Country']: guest.guestAddressNationality,
        ['Landmark']: guest.guestAddressLandmark,
        ['Nearest Airport']: airport ? airport.airportName : '',
        ['Secretary Name']: guest.guestSecretaryName,
        ['Secretary Email']: guest.guestSecretaryEmail,
        ['Secretary Contact No.']: guest.guestSecretaryContactNo,
      };
      guestInfo = Object.assign(guestInfo, detailed_info);
    }
    /* Detailed Guest Info End */

    if (extraInfo.loggedIn_guests) {
      let loggedIn = {};
      if (guest.appLoginTime > 0) {
        loggedIn = {
          ['Logged-In']: 'YES',
          ['Login Date']: moment(guest.appLoginTime).format('DD-MM-YYYY'),
          ['Login Time']: moment(guest.appLoginTime).format('HH:mm')
        }
      } else {
        loggedIn = {
          ['Logged-In']: 'NO'
        }
      }
      guestInfo = Object.assign(guestInfo, loggedIn);
    }
    // Passord Report Start
    if(extraInfo.password_guests) {
      let passowrd = {
        ['Password'] : guest.accessCode
      } 
      guest.guestIsPrimary? guestInfo = Object.assign(guestInfo, passowrd) : null;
    }
    // Passord Report End



    /*FLIGHT INFO START */

    if (extraInfo.flight_info) {
      let flightBookings = FlightBookings.find({ guestId });
      let flightforsaleBookings = FlightforsaleBookings.find({ guestId });
      if (FlightBookings.find({ guestId }).fetch().length > 0) {
        bookDetails = {}
        guestInfo = Object.assign(guestInfo, bookDetails);
        flightBookings.forEach((booking, index) => {
          if (booking.flightId) {

            let flight = Flights.findOne(booking.flightId);
            if (flight) {
              let legs = flight.flightLegs;
              // console.log('legs', legs);
              let info = _.each(legs, (leg, ind) => {

                bookDetails = {};
                let dAirport = Airports.findOne(leg.flightDepartureCityId);
                let aAirport = Airports.findOne(leg.flightArrivalCityId);
                let airline = Airlines.findOne(leg.flightId);
                let zindex = ind + 1;
                // console.log('leg', zindex, leg);
                let info = {
                  ['Flight ' + (index + 1) + ' Agency Booked']: 'True',
                  ['Flight ' + (index + 1) + ' PNR']: flight.flightPNRs[0],
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Airline']: airline ? airline.airlineName : "",
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Flight No']: leg.flightNo,
                  // ['Flight '+ (index+1) +' Leg '+zindex+': PNR']:leg.flightPNR,
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Departure Airport']: dAirport ? dAirport.airportName : "",
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Departure Date']: moment(leg.flightDepartureTime).format('DD-MM-YYYY'),
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Departure Time']: moment(leg.flightDepartureTime).format('HH:mm'),
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Departure Terminal']: leg.flightDepartureTerminal,
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Arrival Airport']: aAirport ? aAirport.airportName : "",
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Arrival Date']: moment(leg.flightArrivalTime).format('DD-MM-YYYY'),
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Arrival Time']: moment(leg.flightArrivalTime).format('HH:mm'),
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Arrival Terminal']: leg.flightArrivalTerminal,
                };
                bookDetails = Object.assign(bookDetails, info);
                guestInfo = Object.assign(guestInfo, bookDetails);
              });
            }

          } else {

            if (booking.flightLegs) {
              let legs = booking.flightLegs;
              // console.log('legs', legs);
              let info = _.each(legs, (leg, ind) => {

                bookDetails = {};
                let dAirport = Airports.findOne(leg.flightDepartureCityId);
                let aAirport = Airports.findOne(leg.flightArrivalCityId);
                let airline = Airlines.findOne(leg.flightId);
                let zindex = ind + 1;
                // console.log('leg', zindex, leg);
                let info = {
                  ['Flight ' + (index + 1) + ' Agency Booked']: 'False',
                  ['Flight ' + (index + 1) + ' PNR']: booking.pnrNumber,
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Airline']: airline ? airline.airlineName : "",
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Flight No']: leg.flightNo,
                  // ['Flight '+ (index+1) +' Leg '+zindex+': PNR']:leg.flightPNR,
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Departure Airport']: dAirport ? dAirport.airportName : "",
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Departure Date']: moment(leg.flightDepartureTime).format('DD-MM-YYYY'),
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Departure Time']: moment(leg.flightDepartureTime).format('HH:mm'),
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Departure Terminal']: leg.flightDepartureTerminal,
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Arrival Airport']: aAirport ? aAirport.airportName : "",
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Arrival Date']: moment(leg.flightArrivalTime).format('DD-MM-YYYY'),
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Arrival Time']: moment(leg.flightArrivalTime).format('HH:mm'),
                  ['Flight ' + (index + 1) + ' Leg ' + zindex + ': Arrival Terminal']: leg.flightArrivalTerminal,
                };
                bookDetails = Object.assign(bookDetails, info);
                guestInfo = Object.assign(guestInfo, bookDetails);
              });
            }



          }

        });
      }
      else if (FlightforsaleBookings.find({ guestId }).fetch().length > 0) {
        bookDetails = {

        }
        guestInfo = Object.assign(guestInfo, bookDetails);

        flightforsaleBookings.forEach((booking, index) => {
          // console.log('in flight sale booking', index);
          let flight = Flightsforsale.findOne(booking.flightId);

          if (flight) {
            let legs = flight.flightLegs;
            let info = _.each(legs, (leg, ind) => {
              let dAirport = Airports.findOne(leg.flightDepartureCityId);
              let aAirport = Airports.findOne(leg.flightArrivalCityId);
              let airline = Airlines.findOne(leg.flightId);
              let zindex = ind + 1;
              let info = {
                ['Flight ' + (index + 1) + ' Agency Booked']: 'True',
                // ['Flight '+ (index+1) + ' PNR']: flight.pnrNumber,
                ['Flight ' + (index + 1) + 'Leg' + zindex + ': Airline']: airline ? airline.airlineName : "",
                ['Flight ' + (index + 1) + 'Leg' + zindex + ': Flight No']: leg.flightNo,
                ['Flight ' + (index + 1) + 'Leg' + zindex + ': PNR']: leg.flightPNR,
                ['Flight ' + (index + 1) + 'Leg' + zindex + ': Departure Airport']: dAirport ? dAirport.airportName : "",
                ['Flight ' + (index + 1) + 'Leg' + zindex + ': Departure Date']: moment(leg.flightDepartureTime).format('DD-MM-YYYY'),
                ['Flight ' + (index + 1) + 'Leg' + zindex + ': Departure Time']: moment(leg.flightDepartureTime).format('HH:mm'),
                ['Flight ' + (index + 1) + 'Leg' + zindex + ': Departure Terminal']: leg.flightDepartureTerminal,
                ['Flight ' + (index + 1) + 'Leg' + zindex + ': Arrival Airport']: aAirport ? aAirport.airportName : "",
                ['Flight ' + (index + 1) + 'Leg' + zindex + ': Arrival Date']: moment(leg.flightArrivalTime).format('DD-MM-YYYY'),
                ['Flight ' + (index + 1) + 'Leg' + zindex + ': Arrival Time']: moment(leg.flightArrivalTime).format('HH:mm'),
                ['Flight ' + (index + 1) + 'Leg' + zindex + ': Arrival Terminal']: leg.flightArrivalTerminal,
              };

              bookDetails = Object.assign(bookDetails, info);
              guestInfo = Object.assign(guestInfo, bookDetails);
            });
          }



        });
      }
    }

    /* HOTEL INFO START */

    if (extraInfo.hotel_info) {
      let hotelBookings = HotelBookings.find({ guestId });
      let hotelForSaleBookings = HotelforsaleBookings.find({ guestId });
      if (hotelBookings.length != 0) {
        hotelBookings.forEach((booking, index) => {
          let hotelRoomId = booking.hotelRoomId;
          let { hotelId } = booking;
          let hotel = Hotels.findOne(hotelId);
          let roomDetails = {};
          let bookDetails = {
            ['Hotel Name : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel ? hotel.hotelName : '',
            ['Dashboard Room No : ' + (hotel ? hotel.hotelName : 'Unknown')]: booking.roomNumber,
            ['Hotel Room No : ' + (hotel ? hotel.hotelName : 'Unknown')]: booking.hotelRoomNumber,
            ['Room Remarks : ' + (hotel ? hotel.hotelName : 'Unknown')]: booking.hotelRoomRemarks,
            ['City : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel ? hotel.hotelAddressCity : '',
          };
          guestInfo = Object.assign(guestInfo, bookDetails);
          for (let i = 0; i < hotel.hotelRooms.length; i++) {
            if (hotel.hotelRooms[i].hotelRoomId == hotelRoomId) {
              roomDetails = {
                ['Room Category :' + (hotel ? hotel.hotelName : 'Unknown')]: hotel.hotelRooms[i].hotelRoomCategory,
                ['Room Type : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel.hotelRooms[i].hotelRoomType,
                ['Bed Type : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel.hotelRooms[i].hotelRoomBedType,
                ['Smoking : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel.hotelRooms[i].hotelRoomIsSmoking,
                ['Adjoining : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel.hotelRooms[i].hotelRoomIsAdjoining,
                ['Connecting : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel.hotelRooms[i].hotelRoomIsConnecting,
                ['Check-in : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel.hotelRooms[i].hotelRoomFrom,
                ['Check-out : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel.hotelRooms[i].hotelRoomTo
              }
            }
          }
          flag = 1;
          guestInfo = Object.assign(guestInfo, roomDetails);
        });
      }
      if (hotelForSaleBookings.length != 0 && flag == 0) {

        hotelForSaleBookings.forEach((booking, index) => {
          let hotelRoomId = booking.hotelRoomId;
          let { hotelId } = booking;
          let hotel = Hotelsforsale.findOne(hotelId);
          let roomDetails = {};
          let bookDetails = {
            ['Hotel Name : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel ? hotel.hotelName : '',
            ['Dashboard Room No : ' + (hotel ? hotel.hotelName : 'Unknown')]: booking.roomNumber,
            ['Hotel Room No : ' + (hotel ? hotel.hotelName : 'Unknown')]: booking.hotelRoomNumber,
            ['Hotel Remarks : ' + (hotel ? hotel.hotelName : 'Unknown')]: booking.hotelRoomRemarks,
            ['City : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel ? hotel.hotelAddressCity : '',
          };
          guestInfo = Object.assign(guestInfo, bookDetails);
          for (let i = 0; i < hotel.hotelRooms.length; i++) {
            if (hotel.hotelRooms[i].hotelRoomId == hotelRoomId) {
              roomDetails = {
                ['Room Category : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel.hotelRooms[i].hotelRoomCategory,
                ['Room Type : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel.hotelRooms[i].hotelRoomType,
                ['Bed Type : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel.hotelRooms[i].hotelRoomBedType,
                ['Smoking : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel.hotelRooms[i].hotelRoomIsSmoking,
                ['Adjoining : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel.hotelRooms[i].hotelRoomIsAdjoining,
                ['Connecting : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel.hotelRooms[i].hotelRoomIsConnecting,
                ['Check-in : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel.hotelRooms[i].hotelRoomFrom,
                ['Check-out : ' + (hotel ? hotel.hotelName : 'Unknown')]: hotel.hotelRooms[i].hotelRoomTo
              }
            }
          }
          guestInfo = Object.assign(guestInfo, roomDetails);
        });
      }

    }

    /* HOTEL INFO END */

    if (extraInfo.insurance_info && guest.insuranceInfo) {
      let iInfo = guest.insuranceInfo;
      guestInfo = {
        ...guestInfo,
        ['Nominee Title']: iInfo.insuranceTitle,
        ['Nominee Name']: iInfo.insuranceFirstName,
        ['Nominee Middle Name']: iInfo.insuranceMiddleName,
        ['Nominee Last Name']: iInfo.insuranceLastName,
        ['Relationship']: iInfo.insuranceRelation,
      };
    }


    if (extraInfo.gifts_info) {
      let giftBookings = GiftBookings.find({ guestId });

      giftBookings.forEach((booking, index) => {
        let gift = Gifts.findOne(booking.giftId);

        let b = {
          ['Gift: ' + (index + 1) + ' Name: ' + (gift ? gift.giftName : "Unknown")]: gift ? gift.giftName : "Unknown",
          ['Gift: ' + (index + 1) + ' Count: ' + (gift ? gift.giftName : "Unknown")]: booking.giftNo,
          ['Gift: ' + (index + 1) + ' Date: ' + (gift ? gift.giftName : "Unknown")]: booking.giftDate,
          ['Gift: ' + (index + 1) + ' Time: ' + (gift ? gift.giftName : "Unknown")]: booking.giftTime,
          ['Gift: ' + (index + 1) + ' Remarks: ' + (gift ? gift.giftName : "Unknown")]: booking.giftRemarks,
        };
        guestInfo = Object.assign(guestInfo, b);

      });
    }


    if (extraInfo.passport_info && guest.passportInfo) {
      let pInfo = guest.passportInfo;
      guestInfo = {
        ...guestInfo,
        ['Nationality']: pInfo.guestNationality,
        ['Photo ID Type']: pInfo.guestPhotoID,
        ['Passport/ID Card No']: pInfo.guestPassportNumber,
        ['Date of Birth']: pInfo.guestDOB,
        ['Place of Issue']: pInfo.guestPassportPlaceOfIssue,
        ['Date of Issue']: pInfo.guestPassportIssueDate,
        ['Date of Expiry']: pInfo.guestPassportExpiryDate,
        ['Address as per ID']: pInfo.guestPassportAddress,
      };
    }


    if (extraInfo.visa_info && guest.visaInformation) {
      let vInfo = guest.visaInformation;
      guestInfo = {
        ...guestInfo,
        ['Country of Issue']: vInfo.guestCountryIssue,
        ['Type of VISA']: vInfo.guestTypeOfVisa,
        ['VISA No']: vInfo.guestVisaNumber,
        ['Valid From']: vInfo.guestValidFrom,
        ['Valid Till']: vInfo.guestValidTill,
      };
    }

    if (extraInfo.services_info) {
      let serviceBookings = ServiceBookings.find({ guestId });

      serviceBookings.forEach((booking, index) => {
        let zindex = index + 1;
        if (guestInfo['Service - ' + booking.serviceName + ': Date'] == undefined || guestInfo['Service - ' + booking.serviceName + ': Date'] == null || guestInfo['Service - ' + booking.serviceName + ': Date'] == '') {
          let b = {
            ['Service - ' + booking.serviceName + ': Date']: booking.serviceDate,
            ['Service - ' + booking.serviceName + ': Time']: booking.serviceTime
          };
          guestInfo = Object.assign(guestInfo, b);
        } else {
          let b = {
            ['Service - ' + booking.serviceName + ': Date']: guestInfo['Service - ' + booking.serviceName + ': Date'] + ', ' + booking.serviceDate,
            ['Service - ' + booking.serviceName + ': Time']: guestInfo['Service - ' + booking.serviceName + ': Time'] + ', ' + booking.serviceTime
          };
          guestInfo = Object.assign(guestInfo, b);
        }

      });
    }


    if (extraInfo.transport_info) {
      let transportBookings = TransportBookings.find({ guestId });

      transportBookings.forEach((booking, index) => {
        let driver = TransportDrivers.findOne(booking.driverId);
        let vehicle = TransportVehicles.findOne(booking.vehicleId);

        let b = {
          ['Booking Type : ' + (index + 1)]: booking.transportType === 'dedicated' ? "Dedicated" : "Pool",
          ['Vehicle Type : ' + (index + 1)]: vehicle ? vehicle.vehicleType : "Unknown",
          ['Vehicle Registration No : ' + (index + 1)]: vehicle ? vehicle.vehicleNo : "Unknown",
          ['Vehicle Remark : ' + (index + 1)]: vehicle ? vehicle.vehicleRemarks : "",
          ['Driver Name : ' + (index + 1)]: driver ? driver.driverName : "Unknown",
          ['Driver Contact no : ' + (index + 1)]: driver ? driver.driverContact : "",
          ['Driver Remark : ' + (index + 1)]: driver ? driver.driverRemarks : "",
          ['Start Date : ' + (index + 1)]: booking.transportStartDate,
          ['Start Time : ' + (index + 1)]: booking.transportStartTime,
          ['End Date : ' + (index + 1)]: booking.transportEndDate,
          ['End Time : ' + (index + 1)]: booking.transportEndTime,
          ['Transport Remarks : ' + (index + 1)]: booking.transportRemarks
        };
        guestInfo = Object.assign(guestInfo, b);

      });
    }

    if (extraInfo.food_info) {
      guestInfo = {
        ...guestInfo,
        ['Meal Preference']: guest.foodPreference,
        ['Meal Remark']: guest.foodPreferencesRemark,
      };
    }

    if (extraInfo.merchandise_info) {
      guestInfo = {
        ...guestInfo,
        ['Merchandise Size']: guest.sizePreference,
        ['Merchandise Remark']: guest.sizeSectionRemarks,
      };
    }

    if (extraInfo.special_assistance_info) {
      if (guest.specialAssistance) {
        var special_assistance = '';
        guest.specialAssistance.forEach((assistance, index) => {
          special_assistance = special_assistance + assistance + ', ';
        })

        guestInfo = {
          ...guestInfo,
          ['Special Assistance']: special_assistance.slice(0, -2),
          ['Special Assistance Remark']: guest.specialAssistanceRemark,
        };
      }

    }


    if (extraInfo.wish_feedback_info) {
      if (guest.guestWish) {
        guestInfo = {
          ...guestInfo,
          ['Wishes']: guest.guestWish,

        };
      }

      if (guest.guestFeedbacks) {

        guest.guestFeedbacks.forEach((feedback, index) => {
          guestInfo = {
            ...guestInfo,
            ['Feedback Questions : ' + feedback.question]: feedback.answer
          };
        });
      }
    }

    guestList.push(guestInfo);
  });
  const ws = XLSX.utils.json_to_sheet(guestList);
  var wscols = [];
  var wsrows = [];

  for (var i = 0; i < 100; i++) {
    // SET MIN. WIDTH
    wscols.push({ wch: 10 });
    // SET MIN. HEIGHT
    wsrows.push({ hpx: 20 });

  }

  ws['!cols'] = wscols;

  ws['!rows'] = wsrows;


  const wb = { SheetNames: ["Sheet1"], Sheets: { Sheet1: ws } };
  // if(!ws.A1.c) ws.A1.c = [];
  // ws.A1.c.push({a:"The Key", t:"I'm a little comment, short and stout!"});
  return wb;
};


const getEventsList = (guestId, eventId) => {
  let event = Events.findOne(eventId);
  let rsvps = RSVP.find({ guestId }).fetch();
  if (!event) {
    return [];
  }
  let sortingType = event.basicDetails.eventSubeventSorting;

  let subevents = SubEvents.find({
    eventId: event._id
  });

  let val = [];
  switch (sortingType) {
    case SubEventSortingTypes.subevent:
      val = getSubEvents(subevents.fetch(), rsvps);
      break;
    case SubEventSortingTypes.date:
      val = getSubEventsByDate(subevents.fetch(), rsvps);
      break;
    case SubEventSortingTypes.destination:
      val = getSubEventsByDestination(subevents.fetch(), rsvps);
      break;
    default:
      break;
  }
  return val;
};

const getSubEvents = (subs, rsvps) => {
  return _.map(subs, (s) => {
    let rsvp = _.find(rsvps, (r) => {
      return r.subEventId === s._id;
    });
    if (rsvp) {
      rsvp = rsvp.status;
    }
    else {
      rsvp = null;
    }
    return {
      subEventTitle: s.subEventTitle,
      subEventId: s._id,
      status: rsvp
    };
  });
};

const getSubEventsByDate = (subs, rsvps) => {
  let dates = _.groupBy(subs, 'subEventDate');
  let events = _.map(dates, (s, d) => {
    let ids = _.map(s, '_id');
    let statuses = _.map(ids, (id) => {
      let rsvp = _.find(rsvps, (r) => {
        return r.subEventId === id;
      });
      if (rsvp) {
        return rsvp.status;
      }
      else {
        return null;
      }
    });
    let status = null;
    if (statuses.length > 0) {
      let unique = !!statuses.reduce(function (a, b) { return (a === b) ? a : NaN; });
      if (unique) {
        status = statuses[0];
      }
    }
    return {
      subEventTitle: d,
      subEventId: _.join(ids, ','),
      status: status
    };
  });
  return events;
};

const getSubEventsByDestination = (subs, rsvps) => {
  let destinations = _.groupBy(subs, 'subEventLocation');
  let events = _.map(destinations, (s, d) => {
    let ids = _.map(s, '_id');
    let statuses = _.map(ids, (id) => {
      let rsvp = _.find(rsvps, (r) => {
        return r.subEventId === id;
      });
      if (rsvp) {
        return rsvp.status;
      }
      else {
        return null;
      }
    });
    let status = null;
    if (statuses.length > 0) {
      let unique = !!statuses.reduce(function (a, b) { return (a === b) ? a : NaN; });
      if (typeof (unique) === "boolean") {
        status = statuses[0];
      }
    }
    return {
      subEventTitle: d,
      subEventId: _.join(ids, ','),
      status: status
    };
  });
  return events;
};
