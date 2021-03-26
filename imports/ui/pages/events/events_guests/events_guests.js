import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";
import { Guests } from "../../../../api/guests/guests.js";
import "./events_guests_export.js";
import "./events_guest_list.js";
import "./events_add_guest.js";
import "./events_guests.scss";
import "./events_guests.html";
import {
  downloadGuestExcel,
  uploadGuestExcel,
  getTotalGuestCount,
  downloadGuestSampleExcel,
} from "../../../../api/guests/methods.js";
import { guestsPerPage } from "../../../../api/guests/guestsPerPage.js";
import XLSX from "xlsx";
import FileSaver from "file-saver";
import { ReactiveVar } from "meteor/reactive-var";
import moment from "moment";
import {
  showError,
  showSuccess,
  showWarning,
} from "../../../components/notifs/notifications.js";

let currentPage = new ReactiveVar(0);
let skipCount = new ReactiveVar(0);
let guestCount = new ReactiveVar({ total: 0, primary: 0 });
let searchTerm = new ReactiveVar("");
let oldPage = 0;
let tempPage = -1;

Template.events_guests.onRendered(function () {
  skipCount.set(0);
  currentPage.set(0);
  searchTerm.set("");
  getTotalGuestCount.call(FlowRouter.getParam("id"), (err, res) => {
    guestCount.set(res);
  });
  this.autorun(() => {
    this.subscribe(
      "guests.event",
      FlowRouter.getParam("id"),
      skipCount.get(),
      searchTerm.get().trim()
    );
    this.$(".tooltip-icon").tooltip({ delay: 50 });
  });
  Meteor.setTimeout(() => {
    Materialize.updateTextFields();
  }, 100);
});

Template.events_guests.events({
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
  },

  "keyup #search-guest"(event, template) {
    searchTerm.set(template.$("#search-guest").val());
    if (searchTerm.get() !== "") {
      if (tempPage == -1) {
        oldPage = skipCount.get();
        skipCount.set(0);
      }
      tempPage = 1;
    } else {
      skipCount.set(oldPage);
      tempPage = -1;
    }
  },
});

Template.events_guests.helpers({
  serviceAddPath() {
    return FlowRouter.path("events.guest.add", {
      id: FlowRouter.getParam("id"),
    });
  },

  guestUploadPath() {
    return FlowRouter.path("events.guest.upload", {
      id: FlowRouter.getParam("id"),
    });
  },

  getGuestCount() {
    return guestCount.get().total;
  },
  getPrimaryGuestCount() {
    return guestCount.get().primary;
  },

  getPagination() {
    let totalGuests = guestCount.get().primary;
    if (searchTerm.get() !== "") {
      totalGuests = Guests.find({ guestIsPrimary: true }).count();
    }
    let pages = Math.floor(totalGuests / guestsPerPage) + 1;

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

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

Template.events_guests.events({
  "change #upload-excel"(event, template) {
    let file = event.currentTarget.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      const name = file.name;
      let time = moment().format("YYYY-MM-DD-HH-mm");
      /* Meteor magic */
      console.log("client 1");
      uploadGuestExcel.call(
        {
          data: data,
          name: name,
          eventId: FlowRouter.getParam("id"),
        },
        (err, wb) => {
          if (err) {
            showError("Error while uploading guest!");
            return;
          }
          if (!wb) {
            showError("Guest uploaded. Error while downloading status sheet.");
            return;
          }
          console.log("back to client");
          var wopts = { bookType: "xlsx", bookSST: false, type: "binary" };
          var wbout = XLSX.write(wb, wopts);
          FileSaver.saveAs(
            new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
            `GuestDataUpload-${time}.xlsx`
          );
          showSuccess("Guest uploaded. Please refer to status sheet.");
        }
      );
    };
    reader.readAsBinaryString(file);
  },
});
Template.events_guest_item.helpers({
  PageNumbers(index) {
    return skipCount.get() + index + 1;
  },
});
