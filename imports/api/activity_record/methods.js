
import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { ActivityRecords } from './activity_record.js';
import { ActivityRecordsSchema } from './schema.js';
import { Roles } from 'meteor/meteor-roles';
import { Events } from '../events/events';

let isAllowed = (userId, role) => {
  let scopes = Roles.getScopesForUser(userId)
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

export const insertActivity = new ValidatedMethod({
  name: "ActivityRecords.methods.insert",
  validate: ActivityRecordsSchema.validator({ clean: true }),
  run(activityNew) {
//REST API DEVELOPMET CHECK - pls remove comments and do necessary code amendments

    // if (isAllowed(this.userId, 'activity-record-insert')) {
      ActivityRecords.insert(activityNew);
    // }
    // else {
    //   throw new Meteor.Error("NO PERMISSIONS");
    // }
  }
});

export const downloadActivityExcel = new ValidatedMethod({
  name: "ActivityRecords.methods.downloadExcel",
  validate: null,
  run({ eventId, extraInfo }) {
    if (!isAllowed(this.userId, 'activity-export')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    if (Meteor.isServer) {
      let wb = require('./server/processExcel.js').getActivityExcel(eventId, extraInfo);
      return wb;
    }
    return null;
  }
});

export const deleteActivity = new ValidatedMethod({
  name: "ActivityRecords.methods.delete",
  validate: null,
  run() {
    if (Roles.userIsInRole(this.userId, 'activity-record-delete')) {
      ActivityRecords.remove({});
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

export const getTotalActivityCount = new ValidatedMethod({
  name: "ActivityRecords.methods.guestCount",
  validate: null,
  run(eventId) {
    let total = ActivityRecords.find({}).count();
    return { total };
  }
});

export const getEventActivityCount = new ValidatedMethod({
  name: "ActivityRecords.methods.guestEventCount",
  validate: null,
  run(eventId) {
    let total = ActivityRecords.find({ 'activityEventId': eventId }).count();
    return { total };
  }
});

export const downloadEventActivityExcel = new ValidatedMethod({
  name: "ActivityRecords.methods.downloadEventExcel",
  validate: null,
  run({ extraInfo }) {
    // TODO :: Add Permission Check and Test
    // if (!Roles.userIsInRole(this.userId, 'activity-record-based-on-event-export')) {
    //   console.log('No Permisson for ', this.userId)
    //   throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    // }
    if (Meteor.isServer) {
      let wb = require('./server/processExcel.js').getActivityExcel(extraInfo);
      return wb;
    } else {
      return null;
    }
  }
  });
  // Activity record function START
export const  activityRecordInsert = (data) => {
  var activityEvent = '';
  var activityEventId = '';
  var activityUserInfo = {};
  if (!Meteor.userId()) {
    activityUserInfo = {
      id: '123456798',
      name: 'API Call',
      email: 'api@call.com',
    }
  } else {
    activityUserInfo = {
      id: Meteor.userId(),
      name: Meteor.user().profile.name,
      email: Meteor.user().emails[0].address,
    }
  }
  if (data.eventId == null || data.eventId == '' || data.eventId == undefined) {
    activityEvent = 'general';
    activityEventId = 'general';
  }
  else {
    var event = Events.findOne(data.eventId);
    activityEvent = event.basicDetails.eventName;
    activityEventId = event._id;
  }
  var date = new Date();
  userdata = {
    activityeDateTime: date,
    activityUserInfo: activityUserInfo,
    activityModule: data.activityModule,
    activitySubModule: data.activitySubModule,
    activityEvent: activityEvent,
    activityEventId: activityEventId,
    activityMessage: data.activityMessage,

  }
  insertActivity.call(userdata, (err, res) => {
    if (err) {
       return false;
    }
    else {
      return true;
    }
  });
};
// Activity record function end
