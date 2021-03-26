// Notification section UIs
import "./eventsNotifications.html";
import "./notificationForm.html";
import "./eventsNotifications.scss";
import "./notificationGuestList";

// Npm Modules
import _ from "lodash";
import moment from "moment-timezone";
import Fuse from "fuse.js";

// Meteor specific files
import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { FlowRouter } from "meteor/kadira:flow-router";
import { ReactiveDict } from "meteor/reactive-dict";

// Server Calls
import {
  addNotification,
  editNotification,
  deleteNotification,
  sendNotification,
  scheduleNotification,
  cancelSchedule,
} from "../../../../api/notifications/methods.js";

import {
  showError,
  showSuccess,
} from "../../../components/notifs/notifications.js";

import { fetchGuestList } from "../../../../api/guests/methods.js";

import { rsvpSubEvents } from "../../../../api/subevents/methods";

// Database Calls
import { Notifications } from "../../../../api/notifications/notifications.js";

import { ReactiveVar } from "meteor/reactive-var";

import { Events } from "../../../../api/events/events";

// Local Data
const timezones = require("../../../../extras/timezones.json");

function tickCheckbox(a) {
  $(`#${a}`).prop("checked", true);
}

// Global Reactive Variables
let editing = new ReactiveVar(false);
let editId = new ReactiveVar("");
let deleteId = new ReactiveVar("");
let pageReady = new ReactiveVar(false);
let showGuests = new ReactiveVar();
let subeventList = new ReactiveVar([]);
let deleteModal = null;
let sendModal = null;

Template.app_notification_settings.onRendered(function () {
  pageReady.set(true);
  this.subscribe("notifications.event", FlowRouter.getParam("id"));
  this.subscribe("guests.all", FlowRouter.getParam("id"));
  editing.set(false);

  Meteor.setTimeout(() => {
    this.$(".modal").modal();
    this.$(".tooltip-icon").tooltip({
      delay: 50,
    });
  }, 1000);
});

Template.app_notification_setting_delete.onRendered(function () {
  deleteModal = this.$(".modal");
  deleteModal.modal();
  this.autorun(() => {
    let edit = editing.get();
    Meteor.setTimeout(() => {
      this.$(".tooltip-icon").tooltip({
        delay: 50,
      });
      this.$(".tooltipped").tooltip({
        delay: 50,
      });
      Materialize.updateTextFields();
    }, 1000);
  });
});

Template.app_notification_setting_delete.events({
  "click .click_delete-driver"(event, template) {
    deleteModal.modal("close");
    let notifId = deleteId.get();
    deleteNotification.call(notifId, (err, res) => {
      if (err) {
        showError(err);
      } else {
        showSuccess("Notification deleted");
      }
    });
  },
});

Template.app_notification_settings.helpers({
  pageReady() {
    return pageReady.get() && Template.instance().subscriptionsReady();
  },
  addNotificationPath: () => {
    return FlowRouter.path("addNotification", {
      id: FlowRouter.getParam("id"),
    });
  },
});

Template.app_notification_settings.events({
  "click .add-notification"(event, template) {
    editing.set(false);
    Meteor.setTimeout(function () {
      // $('#user-list').select2();
      $("#user-list").val("").trigger("change");
    }, 500);
  },
});

Template.app_notification_setting_list.helpers({
  notificationList() {
    let notifs = Notifications.find();
    return notifs.count() > 0 ? notifs : false;
  },
});

Template.notifications_user_list.onRendered(function () {
  this.$(".select2").select2();
  if (this.data.editId) {
    this.autorun(() => {
      let id = this.data.editId.get();
      var guest_name = Notifications.findOne(editId.get());
      this.$(`#${this.data.id}`)
        .val(guest_name.notificationUserList)
        .trigger("change");
    });
  } else {
    this.$(`#${this.data.id}`).val("").trigger("change");
  }
});

let userList = new ReactiveVar([]);

Template.notification_settings_user_list.onRendered(function () {
  this.$(".modal").modal();
});

Template.notification_settings_user_list.helpers({
  userList() {
    return userList.get();
  },
});

Template.app_notification_setting_item.helpers({
  buttonText() {
    return this.notif.notificationCount > 0 ? "RESEND" : "SEND";
  },

  guestCount() {
    let users = this.notif.notificationUserList;
    return users && users.length ? users.length : "ALL";
  },

  canOpen() {
    let users = this.notif.notificationUserList;
    return users && users.length > 0 ? "#user-list-modal" : "";
  },
  notificationEdit() {
    let users = this.notif.notificationUserList;
    return users ? true : false;
  },

  isScheduled() {
    return this.notif.scheduledStatus ? "scheduled" : "not-scheduled";
  },
});

Template.app_notification_setting_item.events({
  "click .edit-notification"(event, template) {
    event.preventDefault();
    const notificationId = template.data.notif._id;
    const eventId = FlowRouter.getParam("id");
    editId.set(notificationId);
    FlowRouter.go("editNotification", {
      id: eventId,
      notificationId,
    });
  },

  "click .delete-notification"(event, template) {
    deleteId.set(template.data.notif._id);
    deleteModal.modal("open");
  },

  "click #sendReSend"(event, tmpl) {
    event.preventDefault();
    const notificationId = tmpl.data.notif._id;
    editId.set(notificationId);
  },

  "click .guest-count"(event, template) {
    let users = template.data.notif.notificationUserList;
    if (users && users.length > 0) {
      let guests = Session.get("guestResult");
      let userNames = [];
      users.forEach((u) => {
        let user = guests.find((g) => g._id === u);
        if (user) {
          userNames.push(user.guestFirstName + " " + user.guestLastName);
        }
      });
      userList.set(userNames);
    } else {
      userList.set([]);
    }
  },
});

// Notification Form starts here
Template.notificationForm.onCreated(function () {
  this.editing = new ReactiveVar(false);
  this.showList = new ReactiveVar(false);
  const eventId = FlowRouter.getParam("id");
  fetchGuestList.call(
    {
      eventId,
      type: "all_guest",
    },
    (err, res) => {
      pageReady.set(true);
      if (err) console.log(err);
      else {
        Session.set("guestList", res);
      }
    }
  );

  // Get Subevents Data
  rsvpSubEvents.call(eventId, (err, res) => {
    if (err) {
      console.log(err);
    } else if (!res.single && res.data) {
      let events = _.map(res.data, (s, d) => {
        let ids = _.map(s, "_id");
        return {
          subEventTitle: d,
          subEventId: _.join(ids, ","),
        };
      });
      subeventList.set(events);
    } else if (res.single && res.data) {
      let events = _.map(res.data, (s, d) => {
        let ids = _.map(s, "_id");
        let title = _.map(s, "subEventTitle");
        let date = _.map(s, "subEventDate");
        return {
          subEventTitle: _.join(title, "") + " - " + date,
          subEventId: _.join(ids, ","),
        };
      });
      subeventList.set(events);
    } else {
      console.log("No SubEvents");
    }
  });
});

async function fetchNotification() {
  const notification = await Notifications.find(
    FlowRouter.getParam("notificationId")
  ).fetch();
  const invitedEvents =
    (await notification) && notification[0] && notification[0].subEvents;
  if (invitedEvents && invitedEvents.length > 0) {
    invitedEvents.map((se) => {
      tickCheckbox(se.toString().replace(/[, ]+/g, "").trim());
    });
  }

  const invitedGuestList =
    (await notification) &&
    notification[0] &&
    notification[0].notificationUserList;
  if (invitedGuestList && invitedGuestList.length > 0) {
    Session.set("selectedGuestIds", invitedGuestList);
  } else {
    let list = [];
    Session.set("selectedGuestIds", list);
  }

  const listType =
    (await notification) && notification[0] && notification[0].listType;

  listType
    ? this.$(`.selectListType input#${listType}`).prop("checked", true)
    : "";

  if (listType === "guest") {
    showGuests.set(true);
  } else {
    showGuests.set(false);
  }
}

Template.notificationForm.onRendered(function () {
  this.subscribe("notifications.event", FlowRouter.getParam("id"));
  this.subscribe("guests.all", FlowRouter.getParam("id"));
  this.subscribe("subevents.event", FlowRouter.getParam("id"));

  const currentRoute = FlowRouter.getRouteName();
  let selectedGuests;
  if (currentRoute === "editNotification") {
    this.editing.set(true);
    this.showList.set(true);
    fetchNotification();
    if (Session.get("selectedGuestIds")) {
      selectedGuests = _.clone(Session.get("selectedGuestIds"));
    } else {
      selectedGuests = [];
    }
  } else {
    this.editing.set(false);
    this.showList.set(false);
    selectedGuests = [];
  }

  Session.set("selectedGuestIds", selectedGuests);

  if (Session.get("guestList").length < 0) {
    fetchGuestList.call(
      {
        eventid: FlowRouter.getParam("id"),
        type: "",
      },
      (err, res) => {
        pageReady.set(true);
        if (err) console.log(err);
        else {
          Session.set("guestList", res);
        }
      }
    );
  }

  this.autorun(() => {
    Meteor.setTimeout(() => {
      this.$(".tooltip-icon").tooltip({
        delay: 50,
      });
      this.$(".tooltipped").tooltip({
        delay: 50,
      });
      this.$(".modal").modal();
      Materialize.updateTextFields();
    }, 1000);
  });
});

Template.notificationForm.helpers({
  title: () => {
    return Template.instance().editing.get()
      ? "Edit Notification"
      : "Add Notification";
  },
  notificationInfo: () => {
    return Template.instance().editing.get()
      ? Notifications.findOne(FlowRouter.getParam("notificationId"))
      : "";
  },
  hasGuests: () => {
    return Session.get("guestResult") && Session.get("guestResult").length > 0
      ? true
      : false;
  },
  showGuests: () => {
    return showGuests.get();
  },
  invitationBy: () => {
    let event = Events.findOne(FlowRouter.getParam("id"));
    return (
      event && event.basicDetails && event.basicDetails.eventSubeventSorting
    );
  },
  notificationPath: () => {
    return FlowRouter.path("events.notifications", {
      id: FlowRouter.getParam("id"),
    });
  },
  showForm: () => {
    return Template.instance().showList.get();
  },
});

Template.notificationForm.events({
  "submit #notificationForm"(event, template) {
    event.preventDefault();
    const eventId = FlowRouter.getParam("id");
    const notificationId = FlowRouter.getParam("notificationId");
    let data = template.$(event.target).serializeObject();
    data.eventId = eventId;
    let invitedEvents = null;
    if (data && data.subEvents) {
      invitedEvents = data.subEvents.join().split(",");
    } else {
      data.subEvents = null;
    }
    data.invitedEvents = invitedEvents;
    const isEdit = template.editing.get();
    if (isEdit) {
      data.notifId = notificationId;
      if (Session.get("selectedGuestIds")) {
        data.notificationUserList = _.clone(Session.get("selectedGuestIds"));
      }
      if (!data.notificationUserList) {
        data.notificationUserList = [];
      }
      editNotification.call(data, (err, res) => {
        if (err) {
          showError(err);
        } else {
          FlowRouter.go("events.notifications", {
            id: eventId,
          });
          showSuccess("Notification Updated");
        }
      });
    } else {
      if (Session.get("selectedGuestIds")) {
        data.notificationUserList = _.clone(Session.get("selectedGuestIds"));
      }
      if (!data.notificationUserList) {
        data.notificationUserList = [];
      }
      addNotification.call(data, (err, res) => {
        if (err) {
          showError(err);
        } else {
          FlowRouter.go("events.notifications", {
            id: eventId,
          });
          showSuccess("Notification Added");
        }
      });
    }
  },

  'change .selectListType input[name="listType"]'(event, template) {
    event.preventDefault();
    template.showList.set(true);
    if (event.target.value === "guest") {
      showGuests.set(true);
    } else {
      showGuests.set(false);
    }
  },
});

Template.notificationSubEventList.helpers({
  subEventList: () => {
    // const eventId = FlowRouter.getParam("id");
    const list = subeventList.get();
    return list.map((item) => {
      return {
        Ids: item.subEventId,
        title: item.subEventTitle,
        selector: item.subEventId.toString().replace(/[, ]+/g, "").trim(),
      };
    });
  },
});

Template.scheduleNofication.onCreated(function () {
  this.timezones = new ReactiveDict();
  this.timezones.set("timezones", []);
});

Template.scheduleNofication.onRendered(function () {
  const notificationId = FlowRouter.getParam("notificationId");
  const notification = Notifications.find({
    _id: notificationId,
  });
  const time = notification && notification.scheduledTime;
  sendModal = this.$(".modal");
  sendModal.modal();

  // Search
  this.timeZoneList = timezones;
  this.searchOptions = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: ["value", "abbr", "text"],
  };

  this.fuse = new Fuse(this.timeZoneList, this.searchOptions);

  this.autorun(() => {
    Meteor.setTimeout(() => {
      this.$(".tabs").tabs();
      this.$("select").material_select();
      this.$("#scheduledTime").val(time);
    }, 1000);
  });
});

Template.scheduleNofication.helpers({
  timeZones: () => {
    const timeZoneList = timezones;
    return timeZoneList.map((a) => {
      return {
        zone: a.text,
        utc: a.utc[0],
      };
    });
  },
  showTimeZone: () => {
    const list = Template.instance().timezones.get("timezones");
    return list.map((item) => {
      return {
        value: item.value,
        abbr: item.abbr,
        utc: item.utc[0],
        text: item.text,
      };
    });
  },
  isScheduled: () => {
    const notificationId = editId.get();
    const notification = Notifications.find({
      _id: notificationId,
    }).fetch();
    if (notification && notification[0].scheduledStatus) {
      return true;
    } else {
      return false;
    }
  },
  notifInfo: () => {
    const notificationId = editId.get();
    const notification = Notifications.find({
      _id: notificationId,
    }).fetch();
    if (notification) {
      const { timeZone, scheduledTime, scheduled } = notification[0];
      let displayTime = moment(scheduledTime)
        .clone()
        .tz(timeZone)
        .format("llll Z");
      return {
        scheduled: scheduled,
        scheduledTime: displayTime,
      };
    }
  },
});

// Schedule Notifications DOM Events

Template.scheduleNofication.events({
  // Search timezones
  // User inputs : timezone search string
  // Task : update meteor dict timezones with search results

  "keyup input#selectTimeZone"(event, tmpl) {
    event.preventDefault();
    const searchResults = tmpl.fuse.search(event.target.value);
    tmpl.timezones.set("timezones", searchResults.slice(0, 5));
  },

  // Select timezone
  // User inputs : timezone value
  // Task : hide rest of timezones and prepare date with time for server

  "click .timezone-card"(event, tmpl) {
    event.preventDefault();
    $(".timezone-card").hide();
    $(".timezone-card").removeClass("active");
    $(event.currentTarget).hide();
    $(event.currentTarget).addClass("active");
    const selectedTimeZone = $(event.currentTarget).attr("data-utc");
    const selectedTzText =
      $(event.currentTarget).attr("data-timezone") +
      ", " +
      $(event.currentTarget).attr("data-abbr");
    console.log(selectedTzText);
    $("input#selectTimeZone").val(selectedTzText);
    $("input#timeZone").val(selectedTimeZone);
  },

  // Send notification
  // User inputs : notification Id
  // Server call : Send notification Id to send notification

  "click .send-notification"(event, tmpl) {
    $("#scheduleNofication").modal("close");
    event.preventDefault();
    const notificationId = editId.get();
    const eventId = FlowRouter.getParam("id");
    sendNotification.call(
      {
        eventId,
        notificationId,
      },
      (err, res) => {
        if (err) {
          console.log("Error while sending notification :::", err);
          showError(err);
        } else {
          showSuccess("Notification Sent");
        }
      }
    );
  },

  // Cancel scheduled notification
  // User inputs : notification Id
  // Server call : Send notification Id to update notification

  "click .cancel-schedule"(event, tmpl) {
    $("#scheduleNofication").modal("close");
    event.preventDefault();
    const notificationId = editId.get();
    cancelSchedule.call(
      {
        notificationId: notificationId,
      },
      (err, res) => {
        if (err) {
          console.log("Error while cancelling scheduled notification :::", err);
          showError(err);
        } else {
          showSuccess("Notification Schedule Cancelled");
        }
      }
    );
  },

  // Schedule Nofication form
  // User inputs : timezone, date and time to be scheduled
  // NotificationTime : same date and time value in selected timezone
  // Send data to server : notification ID, notification time and timezone

  "submit #scheduleForm"(event, tmpl) {
    event.preventDefault();

    // Notification schedule data
    const notificationId = editId.get();
    const timeZone = $("#timeZone").val();
    const notificationTime = moment($("#scheduledTime").val())
      .clone()
      .tz(timeZone, true)
      .format();

    // Call meteor method to update on server
    scheduleNotification.call(
      {
        notificationId,
        notificationTime,
        timeZone,
      },
      (err, res) => {
        if (err) {
          // Show errors, if any
          console.error("Error", err);
          showError(err);
        } else {
          // Show sucess message and close Modal
          showSuccess("Notification Scheduled for later ... ");
          $("#scheduleNofication").modal("close");
        }
      }
    );
  },
});
