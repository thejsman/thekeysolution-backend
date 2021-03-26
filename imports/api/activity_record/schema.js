

import SimpleSchema from 'simpl-schema';

export const ActivityRecordsSchema = new SimpleSchema({
  activityeDateTime: { type : Date },
  //activityeTime: {type : Date},
  activityUserInfo: Object,
  'activityUserInfo.id': String,
  'activityUserInfo.name': String,
  'activityUserInfo.email': String, 
  activityModule: { type : String },
  activitySubModule: { type : String },
  activityMessage: { type : String },
  activityEvent: { type : String, defaultValue:'general' },
  activityEventId: { type : String, defaultValue:'general' },
});
