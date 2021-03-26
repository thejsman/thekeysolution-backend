

import SimpleSchema from 'simpl-schema';

export const PwaActivityRecordsSchema = new SimpleSchema({
  activityeDateTime: { type : Date },
  activityGuestInfo: Object,
  'activityGuestInfo.id': String,
  'activityGuestInfo.name': String,
  'activityGuestInfo.email': String, 
  activityModule: { type : String },
  activitySubModule: { type : String },
  activityMessage: { type : String },
  activityEvent: { type : String, defaultValue:'general' },
  activityEventId: { type : String, defaultValue:'general' },
});
