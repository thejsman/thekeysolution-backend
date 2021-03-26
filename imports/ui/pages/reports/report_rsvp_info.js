import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";
import { ReactiveVar } from "meteor/reactive-var";
import "./report_rsvp_info.scss";
import "./report_rsvp_info.html";
import { Guests } from "../../../api/guests/guests.js";
import {
  getTotalGuestCount,
  getTotalGuestBySortData
} from "../../../api/guests/methods.js";
import { guestsPerPage } from "../../../api/guests/guestsPerPage.js";
import exportReport from "./report_export_rsvp_info.js";

import { deleteGuests } from "../../../api/guests/methods.js";

let currentPage = new ReactiveVar(0);
let skipCount = new ReactiveVar(0);
let guestCount = new ReactiveVar({ total: 0, primary: 0 });
let searchTerm = new ReactiveVar("");

// Child template variables
let guestFilteredList = new ReactiveVar();
let startDate = "";
let endDate = "";
let sortField = "";
let sortDirection = 1;

Template.report_rsvp_info.onRendered(function() {
  skipCount.set(0);
  currentPage.set(0);
  searchTerm.set("");
  getTotalGuestCount.call(FlowRouter.getParam("id"), (err, res) => {
    guestCount.set(res);
  });
  this.autorun(() => {
    // this.subscribe('guests.event', FlowRouter.getParam("id"), skipCount.get(), searchTerm.get().trim());
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

Template.report_rsvp_info.events({
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
    let totalGuests = guestCount.get().total;
    let pages = Math.floor(totalGuests / guestsPerPage) + 1;
    if (cP < pages) {
      let final = cP + 1;
      currentPage.set(final);
      skipCount.set(final * guestsPerPage);
    }
  }
});

Template.report_rsvp_info.helpers({
  serviceAddPath() {
    return FlowRouter.path("events.guest.add", {
      id: FlowRouter.getParam("id")
    });
  },

  getGuestCount() {
    return guestCount.get().total;
  },

  getLoggedInGuestCount() {
    return guestCount.get().loggedin;
  },

  getPagination() {
    let totalGuests = guestCount.get().total;
    if (searchTerm.get() !== "") {
      totalGuests = Guests.find({
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

Template.report_rsvp_info_guest_item.helpers({
  PageNumbers(index) {
    return skipCount.get() + index + 1;
  }
});

Template.report_rsvp_info_guest_list.onRendered(function() {
  this.autorun(() => {
    this.$(".tooltip-icon").tooltip({ delay: 50 });
    this.$(".tooltip-only").tooltip({ delay: 50 });
  });

  filterGuestList();

  this.$(".datepicker").pickadate({
    closeOnSelect: true,
    selectYears: 20,
    onStart: function() {
      this.set("select", undefined);
    }
  });
});

Template.report_rsvp_info_guest_list.helpers({
  templatePagination: function() {
    return Template.instance().pagination;
  },
  clickEvent: function() {
    return function(e) {
      e.preventDefault();
    };
  },

  guestList() {
    return guestFilteredList.get();
  }
});

Template.report_rsvp_info_guest_list.events({
  "click .sort-data"(event, template) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    if (!dataset.sort) {
      return;
    }

    sortField = dataset.sort;
    sortDirection = dataset.sortdirection;

    // sortType = { [dataset.sort]: dataset.sortdirection };

    event.currentTarget.dataset.sortdirection =
      dataset.sortdirection == "-1" ? 1 : -1;

    filterGuestList();

    // getTotalGuestBySortData.call(
    //   {
    //     eventId: FlowRouter.getParam("id"),
    //     skip: skipCount.get(),
    //     sortField: sortField,
    //     direction: sortDirection,
    //     limit: guestsPerPage
    //   },
    //   (err, res) => {
    //     guestFilteredList.set(res);
    //   }
    // );
  },
  "click .exportReport"(event) {
    // console.log(sortField, sortDirection);
    getTotalGuestBySortData.call(
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
  },
  "change .dateFilter"(event) {
    if (event.currentTarget.value) {
      const name = event.currentTarget.attributes.name.nodeValue;
      if (name === "startDate") {
        startDate = event.currentTarget.value;
      } else {
        endDate = event.currentTarget.value;
      }

      filterGuestList();
    }
  }
});

Template.report_rsvp_info_guest_item.onCreated(function() {
  // this.downloading = new ReactiveVar(false);
  // this.familyCount = new ReactiveVar(0);
  // this.familyList = new ReactiveVar();
});

Template.report_rsvp_info_guest_item.onRendered(function() {});

Template.report_rsvp_info_guest_item.helpers({});

Template.report_rsvp_info_guest_item.events({
  "click .click_delete-guest-button"(event, template) {
    mbox.confirm("Are you sure?", yes => {
      if (!yes) return;
      deleteGuests.call(template.data.info._id, (err, res) => {
        if (err) {
          showError(err);
        } else {
          showSuccess("Guest deleted");
        }
      });
    });
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

Template.report_rsvp_info_guest_item.helpers({
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

Template.report_guest_family.helpers({
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
  getTotalGuestBySortData.call(
    {
      eventId: FlowRouter.getParam("id"),
      skip: skipCount.get(),
      sortField: sortField,
      direction: sortDirection,
      limit: guestsPerPage
    },
    (err, res) => {
      if (!err) {
        guestFilteredList.set(
          res.map(g => {
            return {
              ...g,
              loginDateTime: g.appLoginTime
                ? new Date(Number(g.appLoginTime)).toGMTString()
                : ""
            };
          })
        );
      } else {
        guestFilteredList.set([]);
      }
    }
  );
}
