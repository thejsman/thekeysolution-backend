// Time-stamp: 2017-08-24
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import SimpleSchema from "simpl-schema";
import { EventTypes } from "../events/eventTypes.js";

export const NewEventDraftSchema = new SimpleSchema({
  eventId: {
    type: String,
    optional: true,
  },
  eventName: String,
  eventType: {
    type: String,
    allowedValues: EventTypes,
  },
  eventDestination: Array,
  "eventDestination.$": String,
  eventStart: String,
  eventEnd: String,
  eventSubeventSorting: String,
  isEventClose: { type: Boolean, defaultValue: false },
  eventLocationType: { type: Boolean, defaultValue: false },
  eventRSVPBy: String,
});

export const AddHostDetailSchema = new SimpleSchema({
  eventId: String,
  eventHostName: String,
  eventHostContact: String,
  eventHostContactNumber: String,
  eventHostContactEmail: String,
  eventEmailTemplateId: { type: String, optional: true },
});

export const AddFeatureDetailsSchema = new SimpleSchema({
  eventId: String,
  selectedFeatures: {
    type: Array,
    minCount: 0,
  },
  "selectedFeatures.$": String,
  featureRSVPOption: String,
});

export const AddAppDetailsSchema = new SimpleSchema({
  eventId: String,
  selectedAppDetails: {
    type: Array,
    minCount: 0,
  },
  "selectedAppDetails.$": String,
  featureFeedbackType: { type: String, optional: true },
  selectedAppGuestInfo: { type: Array, optional: true },
  "selectedAppGuestInfo.$": String,
  selectedAppSocialDetails: { type: Array, optional: true },
  "selectedAppSocialDetails.$": String,
  selectedAppPreferences: { type: Array, optional: true },
  "selectedAppPreferences.$": String,
});

export const AddUploadedFilesSchema = new SimpleSchema({
  eventId: String,
  uploadedURLS: Object,
  "uploadedURLS.eventLogo": {
    type: String,
    optional: true,
  },
  "uploadedURLS.eventBackground": {
    type: String,
    optional: true,
  },
});
