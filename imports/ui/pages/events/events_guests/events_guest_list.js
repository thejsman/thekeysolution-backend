import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { Guests } from "../../../../api/guests/guests.js";
import { FlowRouter } from "meteor/kadira:flow-router";
import {
  showError,
  showSuccess,
} from "../../../components/notifs/notifications.js";
import {
  updateGuests,
  getFamilyMemberCount,
  deleteGuests,
  getFilesListForGuest,
} from "../../../../api/guests/methods.js";
import {
  sendGuestInvitation,
  sendAllGuestInvitation,
} from "../../../../api/adminusers/methods.js";
import FileSaver from "file-saver";
import { Agencies } from "../../../../api/agencies/agencies.js";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/meteor-roles";

import _ from "lodash";
import JSZip from "jszip";

import "./events_edit_guest.html";
import "./events_guest_list.html";
import "./events_guest_list.scss";
import moment from "moment";
import JSZipUtils from "jszip-utils";

let deleteModal = null;
let deleteId = new ReactiveVar();
let inviteModal = null;
let editModal = null;
let editId = new ReactiveVar();
let editeventId = new ReactiveVar();
let editfamilyId = new ReactiveVar();
let editguestprimary = new ReactiveVar();

function urlToPromise(url) {
  return new Promise(function (resolve, reject) {
    JSZipUtils.getBinaryContent(url, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

let downloadAndSave = (res, id, callback) => {
  var zip = new JSZip();
  let guest = Guests.findOne(id);
  let files = [];
  _.each(res, (gt) => {
    _.each(gt.urls, (list, key) => {
      if (_.isArray(list)) {
        _.each(list, (item, index) => {
          files.push({
            fileName: gt.name + "/" + key + "/" + index + ".jpg",
            fileURL: item,
          });
        });
      } else {
        files.push({
          fileName: gt.name + "/" + key + ".jpg",
          fileURL: list,
        });
      }
    });
  });

  let count = 0;
  for (var i = 0; i < files.length; i++) {
    let file = files[i];
    zip.file(file.fileName, urlToPromise(file.fileURL), { binary: true });
  }

  zip.generateAsync({ type: "blob" }).then(function cb(blob) {
    callback();
    let time = moment().format("YYYY-MM-DD-HH-mm");
    FileSaver.saveAs(
      blob,
      `Guest-${guest.guestFirstName}-${guest.guestLastName}-${guest.folioNumber}-${time}.zip`
    );
  });
};

Template.events_guest_list.onRendered(function () {
  this.autorun(() => {
    this.$(".tooltip-icon").tooltip({ delay: 50 });
    this.$(".tooltip-only").tooltip({ delay: 50 });
  });
});

Template.events_guest_list.helpers({
  templatePagination: function () {
    return Template.instance().pagination;
  },
  clickEvent: function () {
    return function (e) {
      e.preventDefault();
    };
  },

  guestList() {
    const guests = Guests.find({ guestIsPrimary: true });
    return guests;
  },

  guestEmailCount() {
    let x = Guests.find({ guestIsPrimary: true });
    return "";
  },
});

Template.events_guest_list.events({
  "click .click_inviteall-invitation-button"(event, template) {
    inviteModal.modal("open");
  },
});

Template.guest_bulk_invite.onRendered(() => {
  inviteModal = this.$("#guest_invite_modal");
  inviteModal.modal();
});

Template.guest_bulk_invite.events({
  "submit #guest_bulk_invite_form"(event, template) {
    event.preventDefault();
    let data = template.$(event.target).serializeObject();
    let option = data.guest_invite;
    let eventId = FlowRouter.getParam("id");
    sendAllGuestInvitation.call({ option, eventId }, (err, res) => {
      if (err) {
        showError(err.toString());
      } else {
        inviteModal.modal("close");
        showSuccess("Invitation Sent");
      }
    });
  },
});

Template.events_guest_item.onCreated(function () {
  this.downloading = new ReactiveVar(false);
  this.familyCount = new ReactiveVar(0);
  this.familyList = new ReactiveVar();
});

Template.events_guest_item.onRendered(function () {
  console.log("events_guest_item", this.data.info._id);
  getFamilyMemberCount.call(this.data.info._id, (err, res) => {
    let guest = Guests.findOne(this.data.info._id);
    this.familyCount.set(res.length);
    this.familyList.set(res);
  });
});

Template.events_guest_item.helpers({
  hasGuestFamilyList() {
    //not completed
    if (Template.instance().familyList.get()) {
      var guestList = Template.instance().familyList.get();
      return guestList.length;
    }
  },

  guestFamilyList() {
    //not completed
    if (Template.instance().familyList.get()) {
      var guestList = Template.instance().familyList.get();
      return guestList;
    }
  },

  guestCountList() {
    var guestMember = Template.instance().familyCount.get();
    if (guestMember > 0) {
      return guestMember;
    }
    return "";
  },
  guestInviteList() {
    var guestinvite = Guests.findOne({
      guestInviteSent: this.info.guestInviteSent,
      _id: this.info._id,
    });
    return guestinvite.guestInviteSent;
  },

  downloadText() {
    return Template.instance().downloading.get() ? "Preparing..." : "Download";
  },
});

Template.events_guest_item.events({
  "click .click_delete-guest-button"(event, template) {
    mbox.confirm("Are you sure?", (yes) => {
      if (!yes) return;
      deleteGuests.call(template.data.info._id, (err, res) => {
        if (err) {
          showError(err);
        } else {
          showSuccess("Guest deleted");
        }
      });
    });
  },

  "click .guestProfileShow"(event, template) {
    if (
      $(".FamilyMember" + template.data.info.guestFamilyID).hasClass("hide")
    ) {
      $(".FamilyMember" + template.data.info.guestFamilyID).removeClass("hide");
    } else {
      $(".FamilyMember" + template.data.info.guestFamilyID).addClass("hide");
    }
  },

  "click .click_edit-guest-button"(event, template) {
    let id = FlowRouter.getParam("id");
    let guestId = template.data.info._id;
    FlowRouter.go("events.guest.add", { id: id }, { guestId });
  },

  "click .click_resend-invitation-button"(event, template) {
    event.preventDefault();
    sendGuestInvitation.call(this.info, (err, res) => {
      if (err) {
        showError(err.toString());
      } else {
        showSuccess("Invitation Sent");
      }
    });
  },

  "click .click_download-guest-button"(event, template) {
    let id = template.data.info._id;
    let downloading = template.downloading.get();
    if (downloading) return;
    template.downloading.set(true);
    let cb = () => {
      template.downloading.set(false);
    };
    getFilesListForGuest.call(id, (err, res) => {
      if (err) {
        cb();
        showError(err);
        return;
      } else if (_.size(res) < 1) {
        cb();
        showError("There is nothing to download for this guest");
      } else {
        downloadAndSave(res, id, cb);
      }
    });
  },
});

Template.guest_edit_modal.onRendered(function () {
  editModal = this.$(".modal");
  editModal.modal();
});

Template.guest_edit_modal.helpers({
  guestDetails() {
    if (editId.get()) {
      return Guests.findOne(editId.get());
    } else {
      return false;
    }
  },
});

Template.guest_edit_modal.events({
  "submit #edit-guest"(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    data.guestId = editId.get();
    data.eventId = editeventId.get();
    data.guestFamilyID = editfamilyId.get();
    data.guestIsPrimary = editguestprimary.get();
    updateGuests.call(data, (err, res) => {
      if (err) {
        showError(err);
      } else {
        showSuccess("EDITED GUEST DETAILS");
        editModal.modal("close");
      }
    });
  },
});

Template.guest_delete_confirm.onRendered(function () {
  deleteModal = this.$(".modal");
  deleteModal.modal();
});

Template.guest_delete_confirm.events({
  "click .click_delete-guest"(event, template) {
    deleteModal.modal("close");
    var guestId = deleteId.get();
    deleteGuests.call(guestId, (err, res) => {
      if (err) {
        showError(err);
      } else {
        showSuccess("Guest deleted");
      }
    });
  },
});

let isAllowed = (role) => {
  let userId = Meteor.userId();
  let agency = Agencies.find();
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

Template.events_guest_item.helpers({
  templatePagination: function () {
    return Template.instance().pagination;
  },
  clickEvent: function () {
    return function (e) {
      e.preventDefault();
    };
  },
  guestProfilePath(id) {
    if (isAllowed("guest-view-details")) {
      return FlowRouter.path("events.guest.profile", {
        id: FlowRouter.getParam("id"),
        guestId: id,
      });
    } else {
      return "#";
    }
  },
});

Template.event_guest_family.helpers({
  guestProfilePath(id) {
    if (isAllowed("guest-view-details")) {
      return FlowRouter.path("events.guest.profile", {
        id: FlowRouter.getParam("id"),
        guestId: id,
      });
    } else {
      return "#";
    }
  },
});
