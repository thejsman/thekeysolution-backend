import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { DashboardNotificationSchema } from "./schema.js";
import { Notifications } from "./notifications.js";
import { Guests } from "../guests/guests.js";
import _ from "lodash";
import moment from "moment-timezone";
import SimpleSchema from "simpl-schema";

export const addNotification = new ValidatedMethod({
  name: "Notifications.methods.insert",
  validate: DashboardNotificationSchema.validator(),
  run(notif) {
    const isByGuest = notif.listType === "guest";
    const eventId = notif.eventId;
    if (isByGuest) {
      Notifications.insert(notif);
    } else {
      const userList = [];
      const subevents = notif.invitedEvents;
      if (!subevents) {
        throw new Error("Subevent Not selected.");
      }
      subevents.map((subEventId) => {
        const guestIds = Guests.find(
          {
            eventId,
            guestIsPrimary: true,
            inviteStatus: {
              subEventId,
              status: true,
            },
          },
          { _id: 1 }
        ).fetch();
        userList.push(
          guestIds.map((guest) => {
            return guest._id;
          })
        );
      });

      notif.notificationUserList = _.uniq(_.flattenDeep(userList));

      Notifications.insert(notif);
    }
  },
});

export const sendNotification = new ValidatedMethod({
  name: "Notifications.methods.send",
  validate: null,
  run({ notificationId, eventId }) {
    let n = Notifications.findOne(notificationId);
    if (Meteor.isServer) {
      let searchParam = { guestIsPrimary: true, eventId };
      if (n.notificationUserList && n.notificationUserList.length > 0) {
        searchParam = {
          ...searchParam,
          _id: {
            $in: n.notificationUserList,
          },
        };
      }
      let guests = Guests.find(searchParam);
      let contactNumbers = guests.map((g) => {
        let mobileno = g.guestContactNo;
        switch (g.guestPhoneCode) {
          case "":
            mobileno = `+91` + mobileno;
            break;
          case "undefind":
            mobileno = `+91` + mobileno;
            break;
          default:
            mobileno = g.guestPhoneCode + mobileno;
        }
        return mobileno;
      });
      if (Meteor.isServer) {
        let result = require("./server/sendSMS.js").sendSMS(
          contactNumbers,
          n.notificationDescription,
          eventId
        );
        if (result === true) {
          Notifications.update(notificationId, {
            $inc: {
              notificationCount: 1,
            },
            $set: {
              notificationTime: Date.now(),
              scheduledStatus: false,
            },
          });
        } else {
          console.log("Error :::", result);
          // throw new Meteor.Error(result);
        }
        require("./server/sendNotification.js").sendNotificationToEvent(
          eventId,
          n,
          guests
        );
      }
    }
  },
});

export const editNotification = new ValidatedMethod({
  name: "Notifications.methods.edit",
  validate: DashboardNotificationSchema.validator(),
  run(notif) {
    const isByGuest = notif.listType === "guest";
    const eventId = notif.eventId;
    if (isByGuest) {
      Notifications.update(notif.notifId, {
        $set: notif,
      });
      return;
    }

    const userList = [];
    const subevents = notif.invitedEvents;
    if (!subevents) {
      throw new Error("Subevent Not selected.");
    }
    subevents.map((subEventId) => {
      const guestIds = Guests.find(
        {
          eventId,
          guestIsPrimary: true,
          inviteStatus: {
            subEventId,
            status: true,
          },
        },
        { _id: 1 }
      ).fetch();
      userList.push(
        guestIds.map((guest) => {
          return guest._id;
        })
      );
    });
    notif.notificationUserList = _.uniq(_.flattenDeep(userList));
    Notifications.update(notif.notifId, {
      $set: notif,
    });
  },
});

export const deleteNotification = new ValidatedMethod({
  name: "Notifications.methods.delete",
  validate: null,
  run(notifId) {
    Notifications.remove(notifId);
  },
});

// Send Scheduled Notifcations Method
// Cron Job will run this in every few minutes

export const sendScheduledNotification = new ValidatedMethod({
  name: "sendScheduledNotification",
  validate: null,
  run() {
    // Pick two dates for time comparasion, scheduled timw will be compared with these
    // Current Timeframe is 5 minutes
    const currentServerTime = moment(new Date()).format();
    const cycleEndTime = moment(new Date()).add(5, "m").format();

    // Find all notifications that are scheduled in this 3 minute time frame
    const scheduledNotifications = Notifications.find({
      scheduledStatus: true,
      scheduledLocalTime: {
        $gte: new Date(currentServerTime),
        $lt: new Date(cycleEndTime),
      },
    }).fetch();

    // Return empty response when there is no scheduled notifications
    if (!scheduledNotifications) {
      return "";
    }

    // Send all scheduled notification one by one
    scheduledNotifications.map((notification) => {
      // This log is only for testing/development
      console.log("Scheduled Nofication Error ::", notification);
      const { scheduledTime, timeZone, scheduledLocalTime } = notification;
      console.info(
        "Notification ID :: ",
        notification._id,
        "scheduledTime :: ",
        scheduledTime,
        "timeZone :: ",
        timeZone,
        "serverTime :: ",
        scheduledLocalTime
      );
      sendNotification.call({
        notificationId: notification._id,
        eventId: notification.eventId,
      });
    });
  },
});

// Schedule Notifcations Method
// User can send notifications on specific give time in future
// User can select date/time on different timezones

export const scheduleNotification = new ValidatedMethod({
  name: "scheduleNotification",
  validate: new SimpleSchema({
    notificationId: String,
    notificationTime: String,
    timeZone: String,
  }).validator({ clean: true }),
  run({ notificationId, notificationTime, timeZone }) {
    const notification = Notifications.find({ _id: notificationId }).fetch();

    if (!notification) {
      throw new Error("Notification not found.");
    }

    const newtime = moment.parseZone(notificationTime);

    if (newtime.isValid()) {
      const serverTime = newtime.clone().tz(timeZone, true).format();
      Notifications.update(notificationId, {
        $set: {
          scheduledStatus: true,
          scheduledTime: notificationTime,
          timeZone: timeZone,
          scheduledLocalTime: new Date(serverTime),
        },
      });
    } else {
      throw new Error("Notification date is not Valid");
    }
  },
});

// Cancel Scheduled Notifcations Method
// User can cancelled scheduled notifications

export const cancelSchedule = new ValidatedMethod({
  name: "Notifications.methods.cancelSchedule",
  validate: new SimpleSchema({
    notificationId: String,
  }).validator({ clean: true }),
  run({ notificationId }) {
    const notification = Notifications.find({ _id: notificationId });
    if (!notification) {
      throw new Error("Notification not found.");
    }
    Notifications.update(notificationId, {
      $set: {
        scheduledStatus: false,
      },
    });
  },
});
