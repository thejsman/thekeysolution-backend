import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";
import { Guests } from "../../../../api/guests/guests.js";
import "./events_guest_profile_family_members.html";
import { deleteGuests } from "../../../../api/guests/methods.js";
import {
  showError,
  showSuccess,
} from "../../../components/notifs/notifications.js";

Template.events_guest_member_list.helpers({
  guestList() {
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    if (guest) {
      let familyId = guest.guestFamilyID;
      let family = Guests.find({
        guestFamilyID: familyId,
        guestIsPrimary: false,
      });
      return family.count() > 0 ? family : false;
    } else {
      return false;
    }
  },
});

Template.events_guest_member_list_item.helpers({
  guestProfilePath(id) {
    return FlowRouter.path("events.guest.profile", {
      id: FlowRouter.getParam("id"),
      guestId: id,
    });
  },
});

Template.events_guest_member_list_item.events({
  "click .click_edit-guest-button"(event, template) {
    let id = FlowRouter.getParam("id");
    let guestId = template.data.guest._id;
    FlowRouter.go("events.guest.add", { id }, { guestId });
  },

  "click .click_delete-guest-button"(event, template) {
    mbox.confirm("Are you sure?", (yes) => {
      if (!yes) return;

      deleteGuests.call(template.data.guest._id, (err, res) => {
        if (err) showError(err);
        else showSuccess("Deleted guest family member");
      });
    });
  },
});
