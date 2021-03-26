
import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Features } from './features.js';
import { FeaturesSchema } from './schema.js';
import { Roles } from 'meteor/meteor-roles';

export const insertFeature = new ValidatedMethod({
  name: "Features.methods.insert",
  validate: FeaturesSchema.validator({ clean: true }),
  run(featureNew) {
    if(Roles.userIsInRole(this.userId, 'add-feature')) {
      Features.insert(featureNew);
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});


export const updateFeature = new ValidatedMethod({
  name: "Features.methods.update",
  validate: null,
  run(featureUpdate) {
    if(Roles.userIsInRole(this.userId, 'edit-feature')) {
      Features.update(featureUpdate._id, {
	$set: featureUpdate
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

export const deleteFeature = new ValidatedMethod({
  name: "Features.methods.delete",
  validate: null,
  run(id) {
    if(Roles.userIsInRole(this.userId, 'delete-feature')) {
      Features.remove({
	_id: id
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});
