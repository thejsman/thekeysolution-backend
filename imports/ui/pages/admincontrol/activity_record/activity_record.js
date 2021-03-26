import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { ActivityRecords } from "../../../../api/activity_record/activity_record.js";
import { deleteActivity } from "../../../../api/activity_record/methods.js";
import {
  showError,
  showSuccess,
} from "../../../components/notifs/notifications.js";
import { getTotalActivityCount } from "../../../../api/activity_record/methods.js";
import { FlowRouter } from "meteor/kadira:flow-router";
import { activityPerPage } from "../../../../api/activity_record/activityPerPage.js";
import XLSX from "xlsx";
import FileSaver from "file-saver";

let currentPage = new ReactiveVar(0);
let skipCount = new ReactiveVar(0);
let activityCount = new ReactiveVar({ total: 0 });
let searchTerm = new ReactiveVar("");

import "./activity_export.js";
import "./activity_record.html";
import "./activity_record.scss";

let activitySearchModule = new ReactiveVar("");
let activitySearchSubModule = new ReactiveVar("");
let activitySearchEvent = new ReactiveVar("");
let activitySearchMessage = new ReactiveVar("");
let activitySearchUser = new ReactiveVar("");
let activitySearchUserEmail = new ReactiveVar("");
let activitySearchDate = new ReactiveVar("");

var deleteModal = null;

Template.activity_record_page.onRendered(function () {
  skipCount.set(0);
  currentPage.set(0);
  searchTerm.set("");
  getTotalActivityCount.call((err, res) => {
    activityCount.set(res);
  });
  this.autorun(() => {
    // this.subscribe('activity.all')
    this.subscribe("activity.event", skipCount.get(), searchTerm.get());
  });

  activitySearchModule.set("");
  activitySearchSubModule.set("");
  activitySearchEvent.set("");
  activitySearchMessage.set("");
  activitySearchUser.set("");
  activitySearchUserEmail.set("");
  activitySearchDate.set("");

  this.autorun(() => {
    Meteor.setTimeout(() => {
      this.$(".datepicker").pickadate({
        dateFormat: "yy-m-d",
        closeOnSelect: true,
        selectYears: 1000,
        selectMonths: true,
      });
    }, 200);
  });
});

let getLookupObjectOpen = () => {
  let lookupObject = {};
  let searchModule = activitySearchModule.get();
  if (searchModule.length > 0) {
    console.log("2", searchModule);
    lookupObject = {
      ...lookupObject,
      activityModule: new RegExp("^.*" + searchModule + ".*$", "i"),
    };
  }

  let searchSubModule = activitySearchSubModule.get();
  if (searchSubModule.length > 0) {
    console.log("2", searchSubModule);
    lookupObject = {
      ...lookupObject,
      activitySubModule: new RegExp("^.*" + searchSubModule + ".*$", "i"),
    };
  }

  let searchEvent = activitySearchEvent.get();
  if (searchEvent.length > 0) {
    console.log("2", searchEvent);
    lookupObject = {
      ...lookupObject,
      activityEvent: new RegExp("^.*" + searchEvent + ".*$", "i"),
    };
  }

  let searchMessage = activitySearchMessage.get();
  if (searchMessage.length > 0) {
    console.log("2", searchMessage);
    lookupObject = {
      ...lookupObject,
      activityMessage: new RegExp("^.*" + searchMessage + ".*$", "i"),
    };
  }

  let searchUser = activitySearchUser.get();
  if (searchUser.length > 0) {
    lookupObject = {
      ...lookupObject,
      "activityUserInfo.name": new RegExp("^.*" + searchUser + ".*$", "i"),
    };
  }

  let searchEmail = activitySearchUserEmail.get();
  if (searchEmail.length > 0) {
    lookupObject = {
      ...lookupObject,
      "activityUserInfo.email": new RegExp("^.*" + searchEmail + ".*", "i"),
    };
  }

  let searchDate = activitySearchDate.get();
  if (searchDate.length > 0) {
    console.log("2", searchDate);
    //  searchDate=searchDate.getFullYear()+'-'+searchDate.getMonth()+'-'+searchDate.getDate();
    console.log("search date", searchDate);
    lookupObject = {
      ...lookupObject,
      activityeDateTime: new RegExp("^.*" + searchDate + ".*", "i"),
    };
  }

  console.log("8", lookupObject);
  return lookupObject;
};

Template.activity_record_page.helpers({
  hasActivity() {
    return ActivityRecords.find().count() > 0;
  },
  activityList() {
    let lookupObject = getLookupObjectOpen();
    return ActivityRecords.find(lookupObject, {
      sort: { activityeDateTime: -1 },
    });
    console.log("1");
    //return ActivityRecords.find();
  },
  totalActivity() {
    console.log("6");
    return ActivityRecords.find(getLookupObjectOpen()).count();
  },
  getActivityCount() {
    return activityCount.get().total;
  },
  getPagination() {
    let totalActivity = activityCount.get().total;
    let pages = 0;
    if (totalActivity % activityPerPage == 0) {
      pages = Math.floor(totalActivity / activityPerPage);
    } else {
      pages = Math.floor(totalActivity / activityPerPage) + 1;
    }
    // let pages = Math.floor(totalActivity/activityPerPage) + 1;

    let pageList = [];
    for (var i = 0; i < pages; i++) {
      pageList.push({
        pageNo: i,
        isActive: currentPage.get() === i ? "active" : "",
      });
    }
    return pageList;
  },
});

Template.activity_record_page.events({
  "click .page-no"(event, template) {
    let count = parseInt(event.target.id);
    currentPage.set(count);
    skipCount.set(count * activityPerPage);
  },

  "click #page-minus"(event, template) {
    let cP = currentPage.get();
    if (cP > 0) {
      let final = cP - 1;
      currentPage.set(final);
      skipCount.set(final * activityPerPage);
    }
  },

  "click #page-plus"(event, template) {
    let cP = currentPage.get();
    let totalActivity = activityCount.get().total;
    let pages = 0;
    if (totalActivity % activityPerPage == 0) {
      pages = Math.floor(totalActivity / activityPerPage);
    } else {
      pages = Math.floor(totalActivity / activityPerPage) + 1;
    }
    // let pages = Math.floor(totalActivity/activityPerPage) + 1;
    if (cP + 1 < pages) {
      let final = cP + 1;
      currentPage.set(final);
      skipCount.set(final * activityPerPage);
    }
  },

  "click #activity-record-delete-modal"(event, template) {
    console.log("1");
    deleteModal.modal("open");
    console.log("2");
  },

  "input #search_activity_module"(event, template) {
    activitySearchModule.set(event.target.value);
  },

  "input #search_activity_submodule"(event, template) {
    console.log("7");
    activitySearchSubModule.set(event.target.value);
  },

  "input #search_activity_event"(event, template) {
    console.log("7");
    activitySearchEvent.set(event.target.value);
  },

  "input #search_activity_message"(event, template) {
    activitySearchMessage.set(event.target.value);
  },

  "input #search_activity_user"(event, template) {
    activitySearchUser.set(event.target.value);
  },

  "input #search_activity_user_email"(event, template) {
    activitySearchUserEmail.set(event.target.value);
  },

  "change #search_activity_date"(event, template) {
    console.log("event value", event.target.value);
    var months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    var date = event.target.value.split(" ");
    month1 = months.indexOf(date[1].slice(0, -1));

    console.log(month1[0] + "-"(month1 + 1) + "-" + month1[2]);

    activitySearchDate.set(month1[0] + "-"(month1 + 1) + "-" + month1[2]);
  },
});

Template.activity_delete_confirm.onRendered(function () {
  deleteModal = this.$(".modal");
  deleteModal.modal();
});

Template.activity_delete_confirm.events({
  "click .click_delete-activity"(event, template) {
    deleteModal.modal("close");
    deleteActivity.call((err, res) => {
      if (err) {
        showError(err);
      } else {
        showSuccess("All activity log deleted");
      }
    });
  },
});

Template.activity_details_item.helpers({
  PageNumbers(index) {
    return skipCount.get() + index + 1;
  },
});

/*  'click .click_delete-plan'(event, template) {
    deletePlan.call(planId, (err, res) => {
      if(err) {
  showError(err);
      }
      else {
  showSuccess("Plan deleted");
      }
    });
  }*/

/* Template.activity_record_page.events({
  'click .click_edit-plan-button'(event, template) {
    FlowRouter.go('admin.control.plan.edit', { id: FlowRouter.getParam("id"),
    planId: template.data.info._id});
  }
}); */
