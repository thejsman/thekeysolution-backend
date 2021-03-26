import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { App_general_Schema, AppWelcomeSchema, AppAboutSchema, AppAboutPageSchema, AppContactSchema, AppItinerarySchema, AppDestinationSchema, AppWishFeedbackSchema, AppGuestInfoSchema } from './schema.js';

import { App_General } from './app_general.js';
import { Events } from '../events/events.js';
import _ from 'lodash';
import { Roles } from 'meteor/meteor-roles';
import { Agencies } from '../agencies/agencies.js';

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

export const requestApp = new ValidatedMethod({
  name: "App_General.methods.request",
  validate: null,
  run(eventId) {
    if (Meteor.isServer) {
      if (isAllowed(this.userId, ['admin', 'member'])) {
        require('./server/sendAppRequest.js').sendRequest(eventId);
        Events.update(eventId, {
          $set: {
            appRequested: true
          }
        });
      } else {
        throw new Meteor.Error("Not allowed");
      }
    }
  }
});

export const requestDone = new ValidatedMethod({
  name: "App_General.methods.request.done",
  validate: null,
  run(eventId) {
    if (Meteor.isServer) {
      if (isAllowed(this.userId, 'superadmin')) {
        let event = Events.findOne(eventId);
        if (event.basicDetails && event.basicDetails.agency) {

          let agency = Agencies.findOne({ _id: event.basicDetails.agency });
          if (typeof agency.agencyPlanAppsGenerated != 'undefined') {
            Agencies.update({ _id: agency._id }, { $inc: { agencyPlanAppsGenerated: 1 } });
          } else {
            Agencies.update({ _id: agency._id }, { $set: { agencyPlanAppsGenerated: 1 } });
          }
        }
        Events.update(eventId, {
          $set: {
            appRequested: false
          }
        });
      } else {
        throw new Meteor.Error("Not allowed");
      }
    }
  }
});

export const insertAppGeneral = new ValidatedMethod({
  name: "App_General.methods.insert",
  validate: App_general_Schema.validator(),
  run(appnew) {
    UpdateAppDetails(appnew);
  }
});

export const insertAppWelcome = new ValidatedMethod({
  name: "App.Welcome.insert",
  validate: AppWelcomeSchema.validator({ clean: true }),
  run(appdata) {
    UpdateAppDetails(appdata);
  }
});
export const insertAppWishFeedback = new ValidatedMethod({
  name: "App.WishFeedback.insert",
  validate: AppWishFeedbackSchema.validator({ clean: true }),
  run(appdata) {
    UpdateAppDetails(appdata);
  }
});



export const insertAppAbout = new ValidatedMethod({
  name: "App.About.insert",
  validate: AppAboutSchema.validator({ clean: true }),
  run(appdata) {
    UpdateAppDetails(appdata);
  }
});

export const insertAppContact = new ValidatedMethod({
  name: "App.Contact.insert",
  validate: AppContactSchema.validator({ clean: true }),
  run(appdata) {
    let contacts = appdata.contactItems;
    appdata.contactItems = _.filter(contacts, (c) => {
      return c.name && c.number && c.name !== "" && c.number !== "";
    });
    UpdateAppDetails(appdata);
  }
});

export const insertAppItinerary = new ValidatedMethod({
  name: "App.Itinerary.insert",
  validate: AppItinerarySchema.validator({ clean: true }),
  run(appdata) {

    UpdateAppDetails(appdata);
  }
});

export const insertAppDestination = new ValidatedMethod({
  name: "App.Destination.insert",
  validate: AppDestinationSchema.validator({ clean: true }),
  run(details) {
    let event = Events.findOne({ _id: details.eventId });
    if (event) {
      details._id = Random.id();
      App_General.upsert({
        eventId: details.eventId
      }, {
        $push: {
          destinationDetails: details
        }
      });
    }
  }
});

export const updateAppDestination = new ValidatedMethod({
  name: "App.Destination.update",
  validate: AppDestinationSchema.validator({ clean: true }),
  run(details) {
    let event = Events.findOne({ _id: details.eventId });
    if (event) {
      // ABL_SAM added Permission Check
      if (!isAllowed(this.userId, 'edit-destination')) {
        throw new Meteor.Error("NO PERMISSIONS FOR THIS");
      }
      details._id = details.destinationId
      App_General.update({
        eventId: details.eventId,
        "destinationDetails._id": details.destinationId
      }, {
        $set: {
          "destinationDetails.$": details
        }
      });
    }
  }
});

export const deleteAppDestination = new ValidatedMethod({
  name: "App.Destination.delete",
  validate: null,
  run({ eventId, destinationId }) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, 'delete-destination')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    App_General.update({
      eventId
    }, {
        $pull: {
          destinationDetails: {
            _id: destinationId
          }
        }
      });
  }
});

function UpdateAppDetails(details) {
  var event = Events.findOne({ _id: details.eventId });

  if (event) {
    App_General.upsert({
      eventId: details.eventId
    }, { $set: details });
  } else {
    throw new Meteor.Error("Event Id Invalid");
  }
}

// About pages in App

export const addAppAboutPages = new ValidatedMethod({
  name: "App.about.page.add",
  validate: AppAboutPageSchema.validator({ clean: true }),
  run(details) {
    let event = Events.findOne({ _id: details.eventId });
    if (event) {
      details._id = Random.id();
      App_General.upsert({
        eventId: details.eventId
      }, {
        $push: {
          aboutpages: details
        }
      });
    }
  }
});

export const updateAppAboutPages = new ValidatedMethod({
  name: "App.about.page.update",
  validate: AppAboutPageSchema.validator({ clean: true }),
  run(details) {
    let event = Events.findOne({ _id: details.eventId });
    if (event) {
      details._id = details.aboutPageId
      App_General.update({
        eventId: details.eventId,
        "aboutpages._id": details._id
      }, {
        $set: {
          "aboutpages.$": details
        }
      });
    }
  }
  
});

export const deleteAppAboutPages = new ValidatedMethod({
  name: "App.about.page.delete",
  validate: null,
  run({ eventId, pageId }) {
    App_General.update({
      eventId
    }, {
      $pull: {
        aboutpages: {
          _id: pageId
        }
      }
    });
  }
});