import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/meteor-roles';
import { Packages } from './packages.js';
import { PackagesSchema } from './schema.js';



export const insertPackage = new ValidatedMethod({
  name: "Packages.methods.insert",
  validate: PackagesSchema.validator({ clean: true }),
  run(packageNew) {
    if(Roles.userIsInRole(this.userId, 'packages-list')) {
      Packages.insert(packageNew);
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

export const updatePackage = new ValidatedMethod({
  name: "Packages.methods.update",
  validate: PackagesSchema.validator({ clean: true }),
  run(packageUpdate) {
    if(Roles.userIsInRole(this.userId, 'packages-list')) {
      Packages.update(packageUpdate.packageId, {
	$set: packageUpdate
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

export const deletePackage = new ValidatedMethod({
  name: "Packages.methods.delete",
  validate: null,
  run(id) {
    if(Roles.userIsInRole(this.userId, 'packages-list')) {
      Packages.remove({
	      _id: id
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});