import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";
import { ReactiveVar } from "meteor/reactive-var";
import moment from "moment";
// import "./report_flights.scss";
import "./report_flights_departure.html";
// import { Guests } from "../../../api/guests/guests.js";
// import { FlightBookings } from "../../../api/flights/flightBookings.js";
import { Airports } from "../../../api/airports/airports";
import { showError, showSuccess } from "../../components/notifs/notifications";

import {
  getTotalGuestCount,
  getGuestBySortDataWithFlights,
  getLegsMax,
  getGuestBySortDataWithFlightsDeparture
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

Template.report_flights_departure.onRendered(function() {
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
  Meteor.setTimeout(() => {}, 200);
  filterGuestList();
});

Template.report_flights_departure.helpers({
  getGuestCount() {
    return guestCount.get().primary;
  }
});

// report_flights END

// report_flight_guest_list START

Template.report_flight_guest_item_departure.onRendered(function() {
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

Template.report_flight_guest_list_departure.helpers({
  templatePagination: function() {
    return Template.instance().pagination;
  },
  clickEvent: function() {
    return function(e) {
      e.preventDefault();
    };
  },
  getMaxLegs() {
    return getLegsMax.call(FlowRouter.getParam("id"));
  },

  guestList() {
    return guestFilteredList.get();
  },
  noOflegs() {
    let number = [];
    for (let i = 1; i <= maxNumber.get(); i++) {
      number.push(i);
    }
    return number;
  }
});
Template.report_flight_guest_list_departure.onRendered(function() {
  this.$(".datepicker").pickadate({
    closeOnSelect: true,
    selectYears: 20,
    onStart: function() {
      this.set("select", undefined);
    }
  });
});

Template.report_flight_guest_list_departure.events({
  "click .sort-data"(event, template) {
    event.preventDefault();
    const dataset = event.currentTarget.dataset;
    if (!dataset.sort) {
      return;
    }
    sortField = dataset.sort;
    sortDirection = dataset.sortdirection;

    event.currentTarget.dataset.sortdirection =
      dataset.sortdirection == "asc" ? "desc" : "asc";

    filterGuestList();
  },
  "click .exportReportDeparture"(event, template) {
    event.preventDefault();
    eventId = FlowRouter.getParam("id");
    start_date = template.find("#start_date").value;
    end_date = template.find("#end_date").value;
    if (start_date === "" && end_date === "") {
      return showError("Please select Start & End date");
    }
    getGuestBySortDataWithFlightsDeparture.call(
      {
        start_date,
        end_date,
        eventId,
        skip: skipCount.get(),
        sortField: sortField,
        direction: sortDirection,
        limit: guestsPerPage
      },
      (err, res) => {
        if (!err) {
          exportReport(res);
          showSuccess("Report generated successfully");
        } else {
          exportReport([]);
          showError("No data found!");
        }
      }
    );
    // getGuestBySortDataWithFlights.call(
    //   {
    //     eventId: FlowRouter.getParam("id"),
    //     sortField: sortField,
    //     direction: sortDirection,
    //     allRecords: true
    //   },
    //   (err, res) => {
    //     if (!err) exportReport(res);
    //   }
    // );
  },
  "click  .searchReport"(event, template) {
    event.preventDefault();

    eventId = FlowRouter.getParam("id");
    start_date = template.find("#start_date").value;
    end_date = template.find("#end_date").value;
    if (start_date === "" && end_date === "") {
      return showError("Please select Start & End date");
    }
    getGuestBySortDataWithFlightsDeparture.call(
      {
        start_date,
        end_date,
        eventId,
        skip: skipCount.get(),
        sortField: sortField,
        direction: sortDirection,
        limit: guestsPerPage
      },
      (err, res) => {
        if (!err) {
          guestFilteredList.set(res);
        } else {
          guestFilteredList.set([]);
        }
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

Template.flightLeg_departure.helpers({
  getAirport(_id) {
    const airports = Airports.findOne(_id);
    return airports.airportIATA;
  },
  getDateTime(timeStamp) {
    const d = new Date(timeStamp);
    return moment(d).format("DD-MM-YYYY HH:mm");
  }
});

// flightLeg END

// report_flight_guest_item START

Template.report_flight_guest_item_departure.onCreated(function() {});
Template.report_flight_guest_item_departure.onRendered(function() {});
Template.report_flight_guest_item_departure.helpers({
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
