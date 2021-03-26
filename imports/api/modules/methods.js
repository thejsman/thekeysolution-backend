
import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Modules } from './modules.js';
import { ModulesSchema } from './schema.js';
import { Roles } from 'meteor/meteor-roles';

export const insertModule = new ValidatedMethod({
  name: "Modules.methods.insert",
  validate: ModulesSchema.validator({ clean: true }),
  run(moduleNew) {
    if(Roles.userIsInRole(this.userId, 'add-modules')) {
      console.log('data before final insertion',moduleNew);
      Modules.insert(moduleNew);
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

export const updateModule = new ValidatedMethod({
  name: "Modules.methods.update",
  validate: null,
  run(moduleUpdate) {
    if(Roles.userIsInRole(this.userId, 'edit-modules')) {
      console.log('data',moduleUpdate)
      Modules.update(moduleUpdate.moduleId, {
  $set: moduleUpdate 
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

export const deleteModule = new ValidatedMethod({
  name: "Modules.methods.delete",
  validate: null,
  run(id) {
    if(Roles.userIsInRole(this.userId, 'delete-modules')) {
      Modules.remove({
  _id: id
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});
