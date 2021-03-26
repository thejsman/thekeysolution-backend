
import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { PwaActivityRecords as ActivityRecords } from './activity_record.js';
import { PwaActivityRecordsSchema as ActivityRecordsSchema } from './schema.js';
import { Roles } from 'meteor/meteor-roles';

let isAllowed = (userId, role) => {
  let scopes = Roles.getScopesForUser(userId);
  console.log(scopes);
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

export const insertPwaActivity = new ValidatedMethod({
  name: "PwaActivityRecords.methods.insert",
  validate: ActivityRecordsSchema.validator({ clean: true }),
  run(activityNew) {
    ActivityRecords.insert(activityNew);
      console.log('PwaActivityRecorded')
  }
});

export const downloadPwaActivityExcel = new ValidatedMethod({
  name: "PwaActivityRecords.methods.downloadExcel",
  validate: null,
  run({eventId, extraInfo}) {
    // ABL_SAM added Permission Check
        if(!isAllowed(this.userId, 'activity-export')) {
          throw new Meteor.Error("NO PERMISSIONS FOR THIS");
        }
    if(Meteor.isServer) {
      let wb = require('./server/processExcel.js').getActivityExcel(eventId, extraInfo);
      return wb;
    }
    return null;
  }
});

export const deletePwaActivity = new ValidatedMethod({
  name: "PwaActivityRecords.methods.delete",
  validate: null,
  run() {
    if(Roles.userIsInRole(this.userId, 'activity-record-delete')) {
      ActivityRecords.remove({});
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

export const getTotalPwaActivityCount = new ValidatedMethod({
  name: "PwaActivityRecords.methods.guestCount",
  validate: null,
  run(eventId) {
    let total =  ActivityRecords.find({ }).count();
    return { total };
  }
});

export const getEventPwaActivityCount = new ValidatedMethod({
  name: "PwaActivityRecords.methods.guestEventCount",
  validate: null,
  run(eventId) {
    let total =  ActivityRecords.find({'activityEventId': eventId}).count();
    return { total };
  }
});

export const downloadEventPwaActivityExcel = new ValidatedMethod({
  name: "PwaActivityRecords.methods.downloadEventExcel",
  validate: null,
  run({eventId, extraInfo}) {
    // ABL_SAM added Permission Check
    // if(!Roles.userIsInRole(this.userId, 'activity-record-based-on-event-export')) {
    //   throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    // }
    if(Meteor.isServer) {
      let wb = require('./server/processExcel.js').getActivityExcel(eventId, extraInfo);
      return wb;
    }
    return null;
  }
});
