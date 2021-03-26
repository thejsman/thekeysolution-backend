import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Roles } from "meteor/meteor-roles";
import { EventPackages, EventPackageInfo } from "./event_packages.js";
import { SubEvents } from "../subevents/subevents";
import { EventPackagesSchema, EventPackageInfoSchema } from "./schema.js";
import _ from "lodash";

// Common Package Info
export const updatePackageInfo = new ValidatedMethod({
  name: "EventPackages.methods.upsert",
  validate: EventPackageInfoSchema.validator(),
  run(data) {
    EventPackageInfo.update(
      { eventId: data.eventId },
      { $set: data },
      { upsert: true }
    );
  },
});

// Single Packages
export const insertPackage = new ValidatedMethod({
  name: "EventPackages.methods.insert",
  validate: null,
  run(data) {
    let invitedSE = data && data.subevents;
    let subevents = SubEvents.find({ eventId: data.eventId }).fetch();
    let seList = [];
    seList = subevents.map((a) => {
      return {
        subEventId: a._id,
        status: _.includes(invitedSE, a._id),
      };
    });
    data.inviteStatus = seList;
    return EventPackages.insert(data, (err, res) => {
      if (!err) {
        return res;
      }
      throw new Meteor.Error("Error while inserting new package.", err);
    });
  },
});

export const updatePackage = new ValidatedMethod({
  name: "EventPackages.methods.update",
  validate: null,
  run(data) {
    let invitedSE = data && data.subevents;
    let subevents = SubEvents.find({ eventId: data.eventId }).fetch();
    let seList = [];
    seList = subevents.map((a) => {
      return {
        subEventId: a._id,
        status: _.includes(invitedSE, a._id),
      };
    });
    data.inviteStatus = seList;
    EventPackages.update(data.packageId, {
      $set: data,
    });
  },
});

export const deletePackage = new ValidatedMethod({
  name: "EventPackages.methods.delete",
  validate: null,
  run(id) {
    EventPackages.remove({
      _id: id,
    });
  },
});
