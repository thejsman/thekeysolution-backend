import SimpleSchema from 'simpl-schema';

export const DashboardNotificationSchema = new SimpleSchema({
  notifId: { type: String, optional: true },
  notificationDescription: String,
  notificationTitle: String,
  eventId: String,
  guestGroup : { type : String, optional : true },
  listType : { type : String, optional : true },
  subEvents : { type : Array, optional : true },
  "subEvents.$" : String,
  invitedEvents : { type : Array, optional : true },
  "invitedEvents.$" : String,
  notificationUserList: { type: Array, optional: true },
  'notificationUserList.$': String,
  scheduledStatus : {
    type : Boolean,
    defaultValue : false,
    optional : true
  },
  scheduledTime : {
    type : Date,
    optional : true
  }
});
