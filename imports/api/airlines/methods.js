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
import { Roles } from 'meteor/meteor-roles';
import { Airlines } from './airlines.js';
import { AirlinesSchema } from './schema.js';

export const insertAirline = new ValidatedMethod({
  name: "Airlines.methods.insert",
  validate: AirlinesSchema.validator({ clean: true }),
  run(airlineNew) {
    if(Roles.userIsInRole(this.userId, 'airlines-list')) {
      Airlines.insert(airlineNew);
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});


export const updateAirline = new ValidatedMethod({
  name: "Airlines.methods.update",
  validate: AirlinesSchema.validator(),
  run(airlineUpdate) {
    if(Roles.userIsInRole(this.userId, 'airlines-list')) {
      Airlines.update(airlineUpdate.airlineId, {
	$set: airlineUpdate
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

export const deleteAirline = new ValidatedMethod({
  name: "Airlines.methods.delete",
  validate: null,
  run(id) {
    if(Roles.userIsInRole(this.userId, 'airlines-list')) {
      Airlines.remove({
	_id: id
      });
    }
  }
});
