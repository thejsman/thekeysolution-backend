
import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Plans } from './plans.js';
import { PlansSchema } from './schema.js';
import { Roles } from 'meteor/meteor-roles';

export const insertPlan = new ValidatedMethod({
  name: "Plans.methods.insert",
  validate: PlansSchema.validator({ clean: true }),
  run(planNew) {
    if(Roles.userIsInRole(this.userId, 'add-plans')) {
      console.log('data beforee final insertion',planNew);
      Plans.insert(planNew);
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

export const updatePlan = new ValidatedMethod({
  name: "Plans.methods.update",
  validate: null,
  run(planUpdate) {
    if(Roles.userIsInRole(this.userId, 'edit-plans')) {
      console.log('data',planUpdate)
      Plans.update(planUpdate.planId, {
  $set: planUpdate 
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

export const deletePlan = new ValidatedMethod({
  name: "Plans.methods.delete",
  validate: null,
  run(id) {
    if(Roles.userIsInRole(this.userId, 'delete-plans')) {
      Plans.remove({
  _id: id
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});
