// Time-stamp: 2017-06-16 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';
import _ from 'lodash';

export const EventsSchema = new SimpleSchema({
  eventName: { type: String },
  eventType: { type: String },
  eventDescription: { type: String, min: 5},
  eventLocation: { type: String },
  eventStart: { type: String },
  eventEnd: { type: String },
  eventLogo: { type: String },
  eventBackground: { type: String },
  isEventClose :{type: Boolean, defaultValue:false},
  eventLocationType: { type: Boolean, defaultValue: false },
  eventFeatures : { type : Array, minCount: 0, maxCount: 6 , optional : true },
  'eventFeatures.$': { type: String },
  eventServices : { type: Array,  minCount: 0, maxCount: 4 , optional: true },
  'eventServices.$': { type: String },
  eventApplications : { type: Array, minCount: 0, maxCount: 2 , optional: true },
  'eventApplications.$': { type: String },
  hostName: { type: String },
  hostContact: { type : String },
  hostContactNo: { type : String },
  hostEmail: { type: String, regEx: SimpleSchema.RegEx.Email},
  eventAdminEmail : { type : Array, minCount: 1, maxCount: 4 },
  'eventAdminEmail.$': {type : String, regEx: SimpleSchema.RegEx.Email},
});
