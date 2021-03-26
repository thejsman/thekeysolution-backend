import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";
import { ReactiveVar } from "meteor/reactive-var";

import { Guests } from "../../../api/guests/guests.js";
import {
  getTotalGuestCount,
  getGuestBySortDataHotels
} from "../../../api/guests/methods.js";
import { guestsPerPage } from "../../../api/guests/guestsPerPage.js";
import exportReport from "./report_export_hotels";

import "./report_hotels.html";

let currentPage = new ReactiveVar(0);
let skipCount = new ReactiveVar(0);
let guestCount = new ReactiveVar({ total: 0, primary: 0 });
let searchTerm = new ReactiveVar("");
let maxNumber = new ReactiveVar(0);

let guestFilteredList = new ReactiveVar();
let sortField = "";
let sortDirection = 1;

Template.report_hotels.onRendered(function() {
  skipCount.set(0);
  currentPage.set(0);

  getTotalGuestCount.call(FlowRouter.getParam("id"), (err, res) => {
    guestCount.set(res);
  });
  this.autorun(() => {
    this.subscribe(
      "guests.pagination.with.sort",
      FlowRouter.getParam("id"),
      skipCount.get()
    );
    this.$(".tooltip-icon").tooltip({ delay: 50 });
  });
  Meteor.setTimeout(() => {
    Materialize.updateTextFields();
  }, 100);
});

Template.report_hotels.events({
  "click .page-no"(event, template) {
    let count = parseInt(event.target.id);
    currentPage.set(count);
    skipCount.set(count * guestsPerPage);
  },

  "click #page-minus"(event, template) {
    let cP = currentPage.get();
    if (cP > 0) {
      let final = cP - 1;
      currentPage.set(final);
      skipCount.set(final * guestsPerPage);
    }
  },

  "click #page-plus"(event, template) {
    let cP = currentPage.get();
    let totalGuests = guestCount.get().primary;
    let pages = Math.floor(totalGuests / guestsPerPage) + 1;
    if (cP < pages) {
      let final = cP + 1;
      currentPage.set(final);
      skipCount.set(final * guestsPerPage);
    }
  }
});

Template.report_hotels.helpers({
  getGuestCount() {
    return guestCount.get().primary;
  },
  getPagination() {
    let totalGuests = guestCount.get().primary;
    if (searchTerm.get() !== "") {
      totalGuests = Guests.find({
        guestIsPrimary: true,
        eventId: FlowRouter.getParam("id")
      }).count();
    }
    let pages = Math.floor(totalGuests / guestsPerPage) + 1;

    let pageList = [];
    for (var i = 0; i < pages; i++) {
      pageList.push({
        pageNo: i,
        isActive: currentPage.get() === i ? "active" : ""
      });
    }
    return pageList;
  }
});

Template.report_guest_list_hotels.onRendered(function() {
  this.autorun(() => {
    this.$(".tooltip-icon").tooltip({ delay: 50 });
    this.$(".tooltip-only").tooltip({ delay: 50 });
  });

  filterGuestList();
});

Template.report_guest_list_hotels.helpers({
  templatePagination: function() {
    return Template.instance().pagination;
  },
  clickEvent: function() {
    return function(e) {
      e.preventDefault();
    };
  },

  guestListHotels() {
    return guestFilteredList.get();
  },
  noOfHotels() {
    let number = [];
    for (let i = 1; i <= maxNumber.get(); i++) {
      number.push(i);
    }
    return number;
  }
});

Template.report_guest_list_hotels.events({
  "click .sort-data"(event, template) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    if (!dataset.sort) {
      return;
    }

    sortField = dataset.sort;
    sortDirection = dataset.sortdirection;
    event.currentTarget.dataset.sortdirection =
      dataset.sortdirection == "-1" ? 1 : -1;

    filterGuestList();
  },
  "click .exportReportHotels"(event) {
    // console.log(sortField, sortDirection);
    getGuestBySortDataHotels.call(
      {
        eventId: FlowRouter.getParam("id"),
        sortField: sortField,
        direction: sortDirection,
        allRecords: true
      },
      (err, res) => {
        if (!err) exportReport(res);
      }
    );
  }
});

let isAllowed = role => {
  let userId = Meteor.userId();
  let scopes = Roles.getScopesForUser(userId);
  if (scopes.length > 0) {
    for (var i = 0; i < scopes.length; i++) {
      if (Roles.userIsInRole(userId, role, scopes[i])) {
        return true;
      }
    }
    return false;
  } else {
    return Roles.userIsInRole(userId, role);
  }
};

Template.report_guest_item_hotels.helpers({
  PageNumbers(index) {
    return skipCount.get() + index + 1;
  },
  templatePagination: function() {
    return Template.instance().pagination;
  },
  clickEvent: function() {
    return function(e) {
      e.preventDefault();
    };
  },
  guestProfilePath(id) {
    if (isAllowed("guest-view-details")) {
      return FlowRouter.path("events.guest.profile", {
        id: FlowRouter.getParam("id"),
        guestId: id
      });
    } else {
      return "#";
    }
  }
});

Template.report_guest_family_hotels.helpers({
  guestProfilePath(id) {
    if (isAllowed("guest-view-details")) {
      return FlowRouter.path("events.guest.profile", {
        id: FlowRouter.getParam("id"),
        guestId: id
      });
    } else {
      return "#";
    }
  }
});

function filterGuestList() {
  getGuestBySortDataHotels.call(
    {
      eventId: FlowRouter.getParam("id"),
      skip: skipCount.get(),
      sortField: sortField,
      direction: sortDirection,
      limit: guestsPerPage
    },
    (err, res) => {
      if (!err) {
        const max = res.reduce((acc, item, index) => {
          if (item.hotelBookings.length > acc) acc = item.hotelBookings.length;
          return acc;
        }, 0);
        maxNumber.set(max);
        guestFilteredList.set(
          res
          // res.map(g => {
          //   return {
          //     ...g,
          //     loginDateTime: g.appLoginTime ? new Date(Number(g.appLoginTime)).toGMTString()
          //       : ""
          //   };
          // })
        );
      } else {
        maxNumber.set(0);
        guestFilteredList.set([]);
      }
    }
  );
}
