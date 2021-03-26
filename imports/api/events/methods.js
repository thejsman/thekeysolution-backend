import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Roles } from 'meteor/meteor-roles';
import _ from 'lodash';
import CopyToPermanentS3 from './copyImages.js';
import GetURL from './getURL.js';
import { Events } from './events.js';
import { DraftEvents } from '../draftevents/draftevents.js';
import defaultNotifications from '../notifications/defaultNotifications.js';
import { Notifications } from '../notifications/notifications.js';
import { NewEventDraftSchema, AddHostDetailSchema, AddFeatureDetailsSchema, AddAppDetailsSchema, AddUploadedFilesSchema } from '../draftevents/schema.js';
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

export const insertEvent = new ValidatedMethod({
  name: 'Events.methods.insert',
  validate: null,
  run(draftId) {
    // ABL_SAM added Permission Check

    if (Meteor.isServer) {

      if (isAllowed(this.userId, 'add-events')) {
        let draft = DraftEvents.findOne(draftId);

        if (draft) {
          draft.createdAt = new Date();
          let id = Events.insert(draft);
          DraftEvents.remove({
            _id: draft._id
          });
          addNotifications(id, defaultNotifications);
        }
        else {
          throw new Meteor.Error("Draft not found");
        }
      }
      else {
        throw new Meteor.Error("Not allowed");
      }
    }
    return null;
  }
});

export const fetchEventData = new ValidatedMethod({
  name: "Events.one.fetch",
  validate: null,
  run(eventId) {
    return Events.findOne(eventId);
  }
});

function addNotifications(eventId, notifList) {
  notifList.forEach(n => {
    Notifications.insert({
      eventId,
      ...n
    });
  });
}

export const undeleteEvent = new ValidatedMethod({
  name: 'Events.methods.unclose',
  validate: null,
  run(event) {
    Events.update(event, { $set: { "basicDetails.isEventClose": false } });
  }
});

export const deleteEvent = new ValidatedMethod({
  name: 'Events.methods.close',
  validate: null,
  run(datahere) {
    // ABL_SAM added Permission Check

    if (!isAllowed(this.userId, 'close-events')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    Events.update(datahere, { $set: { "basicDetails.isEventClose": true } });
  }
});

export const removeEvent = new ValidatedMethod({
  name: 'Events.methods.remove',
  validate: null,
  run(datahere) {
    // ABL_SAM added Permission Check

    if (!isAllowed(this.userId, 'delete-events')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    Events.update(datahere, {
      $set: {
        'removed': true
      }
    });
  }
});

export const countListEvent = new ValidatedMethod({
  name: 'Events.methods.count',
  validate: null,
  run(datahere) {

    console.log(datahere.eventId)
    let evecount = Events.findOne({ _id: datahere.eventId });
    // var count1 = _.find(evecount.basicDetails, (r) => {
    //  return r.eventName
    //   });
    return evecount.featureDetails;
    // console.log(evecount);
    // console.log(evecount.basicDetails);
    // return evecount;
  }
});

export const updateEventBasicDetails = new ValidatedMethod({
  name: "Events.methods.basicDetails.update",
  validate: NewEventDraftSchema.validator({ clean: true }),
  run(data) {
    let agencies = Roles.getScopesForUser(this.userId);
    let agency = agencies[0];
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, 'edit-event')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    if (Meteor.isServer) {
      let event = Events.findOne(data.eventId);
      data.agency = event.basicDetails.agency;
      Events.update(data.eventId, {
        $set: {
          basicDetails: data
        }
      });
      return data.eventId;
    }
  }
});

export const updateEventHostDetails = new ValidatedMethod({
  name: "Events.methods.hostDetails.update",
  validate: AddHostDetailSchema.validator({ clean: true }),
  run(data) {
    // ABL_SAM added Permission Check

    if (!isAllowed(this.userId, 'edit-event')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    Events.update(data.eventId, {
      $set: {
        hostDetails: data
      }
    });
    return data.eventId;
  }
});

export const updateEventFeatureDetails = new ValidatedMethod({
  name: "Events.methods.featureDetails.update",
  validate: AddFeatureDetailsSchema.validator({ clean: true }),
  run(data) {
    // ABL_SAM added Permission Check

    if (!isAllowed(this.userId, 'edit-event')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    Events.update(data.eventId, {
      $set: {
        featureDetails: data
      }
    });
    return data.eventId;
  }
});

export const updateEventAppDetails = new ValidatedMethod({
  name: "Events.methods.appDetails.update",
  validate: AddAppDetailsSchema.validator({ clean: true }),
  run(data) {
    // ABL_SAM added Permission Check

    if (!isAllowed(this.userId, 'edit-event')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    Events.update(data.eventId, {
      $set: {
        appDetails: data
      }
    });
    return data.eventId;
  }
});

export const updateEventImages = new ValidatedMethod({
  name: "Events.methods.uploadedData.update",
  validate: AddUploadedFilesSchema.validator({ clean: true }),
  run(uploadedData) {
    // ABL_SAM added Permission Check
    ;
    if (!isAllowed(this.userId, 'edit-event')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    Events.update(uploadedData.eventId, {
      $set: {
        uploadedData: uploadedData
      }
    });
    return uploadedData.eventId;
  }
});
