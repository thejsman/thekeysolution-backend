import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";
import { ReactiveVar } from "meteor/reactive-var";
// import "./report_flights.scss";
import "./report_flights.html";
// import { Guests } from "../../../api/guests/guests.js";
// import { FlightBookings } from "../../../api/flights/flightBookings.js";

import {
  getTotalGuestCount,
  getGuestBySortDataWithFlights
} from "../../../api/guests/methods.js";
import { guestsPerPage } from "../../../api/guests/guestsPerPage.js";
import exportReport from "./report_export_flights.js";

let currentPage = new ReactiveVar(0);
let skipCount = new ReactiveVar(0);
let guestCount = new ReactiveVar({ total: 0, primary: 0 });
let searchTerm = new ReactiveVar("");
let maxNumber = new ReactiveVar(0);

// Child template variables
let guestFilteredList = new ReactiveVar();
let startDate = "";
let endDate = "";
let sortField = "";
let sortDirection = 1;

// report_flights START

Template.report_flights.onRendered(function() {
  skipCount.set(0);
  currentPage.set(0);

  getTotalGuestCount.call(FlowRouter.getParam("id"), (err, res) =>
    guestCount.set(res)
  );

  this.autorun(() => {
    // this.subscribe('guests.event', FlowRouter.getParam("id"), skipCount.get(), searchTerm.get().trim());
    this.subscribe(
      "guests.pagination.with.sort",
      FlowRouter.getParam("id"),
      skipCount.get()
    );
    this.subscribe("event.flightBookings", FlowRouter.getParam("id"));
    this.subscribe("airports.all");

    this.$(".tooltip-icon").tooltip({ delay: 50 });
  });
  Meteor.setTimeout(() => {
    Materialize.updateTextFields();
  }, 100);
  filterGuestList();
});

Template.report_flights.helpers({
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

// report_flights END

// report_flight_guest_list START

Template.report_flight_guest_item.onRendered(function() {
  this.autorun(() => {
    this.$(".tooltip-icon").tooltip({ delay: 50 });
    this.$(".tooltip-only").tooltip({ delay: 50 });
  });

  this.$(".datepicker").pickadate({
    closeOnSelect: true,
    selectYears: 20,
    onStart: function() {
      this.set("select", undefined);
    }
  });
});

Template.report_flight_guest_list.helpers({
  templatePagination: function() {
    return Template.instance().pagination;
  },
  clickEvent: function() {
    return function(e) {
      e.preventDefault();
    };
  },
  noOflegs() {
    let number = [];
    for (let i = 1; i <= maxNumber.get(); i++) {
      number.push(i);
    }
    return number;
  },

  guestList() {
    // console.log("Guest list: ", guestFilteredList.get());
    return guestFilteredList.get();
  }
});

Template.report_flight_guest_list.events({
  "click .sort-data"(event, template) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    if (!dataset.sort) {
      return;
    }
    sortField = dataset.sort;
    sortDirection = dataset.sortdirection;

    event.currentTarget.dataset.sortdirection =
      dataset.sortdirection == 1 ? -1 : 1;

    filterGuestList();
  },
  "click .exportReport"(event) {
    getGuestBySortDataWithFlights.call(
      {
        eventId: FlowRouter.getParam("id"),
        sortField: sortField,
        direction: sortDirection,
        allRecords: true
      },
      (err, res) => {
        if (err) console.log(err);
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

// report_flight_guest_list END

// flightLeg START

Template.flightLeg.helpers({
  getDateTime(timeStamp) {
    const d = new Date(timeStamp);
    const date = d.toLocaleDateString();
    const time = d.toLocaleTimeString();
    return `${date} ${time}`;
  }
});

// flightLeg END

// report_flight_guest_item START

Template.report_flight_guest_item.onCreated(function() {});
Template.report_flight_guest_item.onRendered(function() {});
Template.report_flight_guest_item.helpers({
  PageNumbers(index) {
    return skipCount.get() + index + 1;
  }
});

// report_flight_guest_item END

// Functions
function filterGuestList() {
  getGuestBySortDataWithFlights.call(
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
          if (item.flights.length > acc) acc = item.flights.length;
          return acc;
        }, 0);
        maxNumber.set(max);
        guestFilteredList.set(res);
      } else {
        maxNumber.set(0);
        guestFilteredList.set([]);
      }
    }
  );
}
