import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { FlowRouter } from "meteor/kadira:flow-router";
import { rsvpSubEvents } from "../../../../api/subevents/methods";
import { Events } from "../../../../api/events/events";
import { uploadGuestExcel } from "../../../../api/guests/methods.js";
import XLSX from "xlsx";
import FileSaver from "file-saver";
import {
  showError,
  showSuccess,
  showWarning,
} from "../../../components/notifs/notifications.js";
import "./events_guests_upload.html";
import _ from "lodash/lodash";
import moment from "moment";

let subeventList = new ReactiveVar([]);
let newguestList = new ReactiveVar({});
let fileName = new ReactiveVar();
let inProgress = new ReactiveVar(false);

Template.events_guests_upload.onRendered(function () {
  let eId = FlowRouter.getParam("id");
  rsvpSubEvents.call(eId, (err, res) => {
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

Template.events_guests_upload.helpers({
  subeventsList() {
    return subeventList.get();
  },

  invitationBy() {
    let event = Events.findOne(FlowRouter.getParam("id"));
    return event.basicDetails.eventSubeventSorting;
  },

  inProgress() {
    return inProgress.get();
  },
});

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}

Template.events_guests_upload.events({
  "change #upload-excel"(event, template) {
    let file = event.currentTarget.files[0];
    const reader = new FileReader();
    reader.onload = function (e) {
      const data = e.target.result;
      const name = file.name;
      let wb = XLSX.read(data, { type: "binary" });
      let bookingdata = XLSX.utils.sheet_to_json(wb.Sheets.Sheet1);
      newguestList.set(bookingdata);
      fileName.set(name);
    };
    reader.readAsBinaryString(file);
  },

  "submit #bulk-upload-guest"(event, template) {
    event.preventDefault();
    let data = template.$(event.target).serializeObject();
    let invitedEvents = null;
    if (!_.isEmpty(data)) {
      invitedEvents = data.subevents.join().split(",");
    }
    let time = moment().format("YYYY-MM-DD-HH-mm");
    inProgress.set(true);
    uploadGuestExcel.call(
      {
        data: newguestList.get(),
        name: fileName.get(),
        eventId: FlowRouter.getParam("id"),
        invitelist: invitedEvents,
      },
      (err, wb) => {
        if (err) {
          inProgress.set(false);
          showError("Error while uploading guest!");
          return;
        }
        if (!wb) {
          inProgress.set(false);
          showError("Guest uploaded. Error while downloading status sheet.");
          return;
        }
        var wopts = { bookType: "xlsx", bookSST: false, type: "binary" };
        var wbout = XLSX.write(wb, wopts);
        FileSaver.saveAs(
          new Blob([s2ab(wbout)], { type: "application/octet-stream" }),
          `GuestDataUpload-${time}.xlsx`
        );
        inProgress.set(false);
        showSuccess("Guest uploaded. Please refer to status sheet.");
      }
    );
  },
});
