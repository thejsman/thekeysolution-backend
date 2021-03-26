// Time-stamp: 2017-08-02 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : methods.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Airports } from './airports.js';
import { AirportsSchema } from './schema.js';
import { Roles } from 'meteor/meteor-roles';

export const insertAirport = new ValidatedMethod({
  name: "Airports.methods.insert",
  validate: AirportsSchema.validator({ clean: true }),
  run(airportNew) {
    if(Roles.userIsInRole(this.userId, 'airport-list')) {
      Airports.insert(airportNew);
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});


export const updateAirport = new ValidatedMethod({
  name: "Airports.methods.update",
  validate: AirportsSchema.validator({ clean: true }),
  run(airportUpdate) {
    if(Roles.userIsInRole(this.userId, 'airport-list')) {
      Airports.update(airportUpdate.airportId, {
	$set: airportUpdate
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

export const deleteAirport = new ValidatedMethod({
  name: "Airports.methods.delete",
  validate: null,
  run(id) {
    if(Roles.userIsInRole(this.userId, 'airport-list')) {
      Airports.remove({
	_id: id
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});
