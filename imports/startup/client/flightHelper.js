import { Template } from 'meteor/templating';
import { Airports } from '../../api/airports/airports.js';
import { Airlines } from '../../api/airlines/airlines.js';

Template.registerHelper('flightName', (flight) => {
  // pass in legs as well
  var flightLegs = flight.flightLegs ? flight.flightLegs : flight;
  var depCity = flightLegs[0] ? flightLegs[0] : flightLegs;
  var arrCity = flightLegs[flightLegs.length - 1];
  arrCity = arrCity ? arrCity : flightLegs;
  var departureCity = Airports.findOne({
    _id: depCity.flightDepartureCityId
  });
  console.log('00000000000000000',departureCity);
  var arrivalCity = Airports.findOne({
    _id: arrCity.flightArrivalCityId
  });  
  return {
    _id: flight._id,
    first: departureCity,
    last: arrivalCity
  };
});

Template.registerHelper('parseAirlineName', (flightLeg) => {
  if(!flightLeg) {
    return "";
  }
  let airline = Airlines.findOne(flightLeg);
  // console.log("Airline Name: ----- ", airline);
  return airline ? airline.airlineName : "";
});

Template.registerHelper('parseAirlineDetails', (flightLeg) => {
  if(!flightLeg) {
    return "";
  }
  let airline = Airlines.findOne(flightLeg);
  // console.log("Airline Name: ----- ", airline);
  return airline ? airline.airlineIATA+', '+airline.airlineName+' - '+airline.airlineCountry : "";
});

Template.registerHelper('parseAirlineIATA', (flightLeg) => {
  if(!flightLeg) {
    return "";
  }
  let airline = Airlines.findOne(flightLeg);
  // console.log("Airline Name: ----- ", airline);
  return airline ? airline.airlineIATA : "";
});

Template.registerHelper('flightDepartureArrival', (flight) => {
  var flightLegs = flight.flightLegs;
  var departureTime = flightLegs[0].flightDepartureTime;
  var arrivalTime = flightLegs[flightLegs.length - 1].flightArrivalTime;  
  return {
    departureTime, arrivalTime
  };
});

Template.registerHelper('equals', function (a, b) {
  return a === b;
});

Template.registerHelper('bothexist', function (a, b) {
  return a && b;
});