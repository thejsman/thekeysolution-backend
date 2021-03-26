// Time-stamp: 2017-08-24
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : methods.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { NewEventDraftSchema,
	 AddHostDetailSchema,
	 AddFeatureDetailsSchema,
	 AddAppDetailsSchema,
	 AddUploadedFilesSchema } from './schema.js';
import { DraftEvents } from './draftevents.js';
import { Roles } from 'meteor/meteor-roles';

export const insertDraftEvent = new ValidatedMethod({

  name: "DraftEvents.methods.insert",
  validate: NewEventDraftSchema.validator({ clean: true }),
  run(draftNew) {
    let agencies = Roles.getScopesForUser(this.userId);
    let agency = agencies[0];
    if(Roles.userIsInRole(this.userId, 'add-events', agency)) {
      let agency = agencies.length > 0 ? agencies[0] : 'super-admin';

      draftNew.agency = agency;
      let id = draftNew.eventId;
      if (id) {
	DraftEvents.update({
	  _id: id
	}, {
	  $set: {
	    basicDetails: draftNew
	  }
	});
      }
      else {
	id = DraftEvents.insert({
	  basicDetails: draftNew
	});
      }
      return id;
    }
    else {
      throw new Meteor.Error("Not allowed");
    }
  }
});


export const addHostDetails = new ValidatedMethod({
  name: "DraftEvents.methods.addHostDetails",
  validate: AddHostDetailSchema.validator({ clean : true }),
  run(hostDetails) {
    if(Meteor.isServer) {
      let agencies = Roles.getScopesForUser(this.userId);
      let agency = agencies[0];
      if(Roles.userIsInRole(this.userId, 'add-events', agency)) {
	let draft = DraftEvents.find(hostDetails.eventId);
	if(draft.count() < 1) {
	  throw new Meteor.Error('Invalid event id');
	}
	else {
	  DraftEvents.update({
	    _id: hostDetails.eventId
	  }, {
	    $set: {
	      hostDetails: hostDetails
	    }
	  });
	  return hostDetails.eventId;
	}
      }
      else {
	throw new Meteor.Error("Not allowed");
      }
    }
    return null;
  }
});

export const addFeatureDetails = new ValidatedMethod({
  name: "DraftEvents.methods.addFeatureDetails",
  validate: AddFeatureDetailsSchema.validator({ clean: true }),
  run(featureDetails) {
    if(Meteor.isServer) {
      let agencies = Roles.getScopesForUser(this.userId);
      let agency = agencies[0];
      if(Roles.userIsInRole(this.userId, 'add-events', agency)) {
	let draft = DraftEvents.find(featureDetails.eventId);
	if(draft.count() < 1) {
	  throw new Meteor.Error('Invalid event id');
	}
	else {
	  DraftEvents.update({
	    _id: featureDetails.eventId
	  }, {
	    $set: {
	      featureDetails: featureDetails
	    }
	  });
	  return featureDetails.eventId;
	}
      }
      else {
	throw new Meteor.Error("Not Allowed");
      }
    }
    return null;
  }
});

export const addAppDetails = new ValidatedMethod({
  name: "DraftEvents.methods.addAppDetails",
  validate: AddAppDetailsSchema.validator({ clean: true }),
  run(appDetails) {
    if(Meteor.isServer) {
      let agencies = Roles.getScopesForUser(this.userId);
      let agency = agencies[0];
      if(Roles.userIsInRole(this.userId, 'add-events', agency)) {
	let draft = DraftEvents.find(appDetails.eventId);
	if(draft.count() < 1) {
	  throw new Meteor.Error('Invalid event id');
	}
	else {
	  DraftEvents.update({
	    _id: appDetails.eventId
	  }, {
	    $set: {
	      appDetails: appDetails
	    }
	  });
	  return appDetails.eventId;
	}
      }
      else {
	throw new Meteor.Error("Not Allowed");
      }
    }
    return null;
  }
});

export const addUploadedFiles = new ValidatedMethod({
  name: "DraftEvents.methods.addUploadedFiles",
  validate: AddUploadedFilesSchema.validator(),
  run(uploadedData) {
    if(Meteor.isServer)  {
      let agencies = Roles.getScopesForUser(this.userId);
      let agency = agencies[0];
      if(Roles.userIsInRole(this.userId, 'add-events', agency)) {
	let draft = DraftEvents.find(uploadedData.eventId);
	if(draft.count() < 1) {
	  throw new Meteor.Error("Invalid event id");
	}
	else {
	  DraftEvents.update({
	    _id: uploadedData.eventId
	  }, {
	    $set: {
	      uploadedData: uploadedData
	    }
	  });
	  return uploadedData.eventId;
	}
      }
      else {
	throw new Meteor.Error("Not Allowed");
      }
    }

    return null;
  }
});
