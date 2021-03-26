import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";
import { Services } from "../../../../api/services/services.js";
import { mbox } from "../../../components/mbox/mbox.js";
import { Meteor } from "meteor/meteor";
import {
  removeService,
  slotCount,
  removeProvider,
  addProviders,
  updateProvider,
} from "../../../../api/services/methods.js";
import "./events_services_details.html";
import "./events_services.scss";
import {
  showSuccess,
  showError,
} from "../../../components/notifs/notifications.js";
import { ReactiveVar } from "meteor/reactive-var";
import { Events } from "../../../../api/events/events.js";
import moment from "moment";

let editModal = null;
let editId = new ReactiveVar(null);

Template.events_services_details.onRendered(function () {
  this.$(".tooltipped").tooltip({ delay: 50 });
  editId.set(null);
  this.subscribe("services.one", FlowRouter.getParam("serviceId"));
});

Template.events_services_details.helpers({
  serviceInfo() {
    return Services.findOne(FlowRouter.getParam("serviceId"));
  },

  serviceProviders() {
    let service = Services.findOne(FlowRouter.getParam("serviceId"));
    if (service) {
      return service.providers ? service.providers : [];
    }
    return [];
  },
});

Template.events_services_details.events({
  "click .click_delete-button"(event, template) {
    mbox.confirm("Are you sure you want to delete this?", (yes) => {
      if (yes) {
        removeService.call(FlowRouter.getParam("serviceId"), (err, res) => {
          if (!err) {
            FlowRouter.go("events.services", { id: FlowRouter.getParam("id") });
          }
        });
      }
    });
  },
});

Template.service_details_providers_list_item.onCreated(function () {
  this.slotCount = new ReactiveVar("Fetching");
});

Template.service_details_providers_list_item.onRendered(function () {
  slotCount.call(this.data.provider._id, (err, res) => {
    this.slotCount.set(res > 0 ? res : "Fetching...");
  });
});

Template.service_details_providers_list_item.helpers({
  slotCount() {
    return Template.instance().slotCount.get();
  },
});

Template.service_details_providers_list_item.events({
  "click .click_delete-slots-button"(event, template) {
    mbox.confirm(
      "Are you sure? This will remove all bookings as well",
      (yes) => {
        if (!yes) return;
        let providerId = template.data.provider._id;
        let serviceId = FlowRouter.getParam("serviceId");
        removeProvider.call({ providerId, serviceId }, (err, res) => {
          if (err) showError(err);
          else showSuccess("Removed provider");
        });
      }
    );
  },

  "click .click_edit-slots-button"(event, template) {
    editId.set(template.data.provider._id);
  },
});

Template.events_services_add_provider.onRendered(function () {
  this.$(".modal").modal();
  this.$(".tooltipped").tooltip({ delay: 50 });
  this.$(".datepicker").pickadate({
    selectYears: true,
    selectMonths: true,
  });
  this.$(".timepicker").pickatime();

  let startpicker = this.$("#serviceStartDate").pickadate("picker");
  let endpicker = this.$("#serviceEndDate").pickadate("picker");
  let startTimePicker = this.$("#serviceStartTime").pickatime("picker");
  let endTimePicker = this.$("#serviceEndTime").pickatime("picker");
  this.initialized = false;
  this.autorun(() => {
    let event = Events.findOne();
    if (event && !this.initialized) {
      let defaultDate = event.basicDetails.eventStart;
      let m = moment(defaultDate);
      let date = m.isValid() ? m.toDate() : false;
      if (date) {
        startpicker.set("select", [
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        ]);
        endpicker.set("select", [
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        ]);
      }
      this.initialized = true;
    }
  });

  startpicker.on("set", (info) => {
    console.log(info);
    endpicker.set("min", new Date(info.select));
    endpicker.set("select", info.select);
  });

  this.autorun(() => {
    let editing = editId.get();
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
    }, 100);
  });
  // this.autorun(() => {
  //   let editing = editId.get();
  //   if(editing) {
  //     let provider = getProvider(editing);
  //     if(provider.serviceStartDate) startpicker.set('select', provider.serviceStartDate);
  //     if(provider.serviceEndDate) endpicker.set('select', provider.serviceEndDate);
  //     if(provider.serviceStartTime) startTimePicker.set('select', provider.serviceStartTime);
  //     if(provider.serviceEndTime) endTimePicker.set('select', provider.serviceEndTime);
  //   }
  // });
});

function getProvider(id) {
  let service = Services.findOne(FlowRouter.getParam("serviceId"));
  let provider = service.providers.find((p) => p._id === id);

  if (provider) {
    return provider;
  }
  return {};
}

Template.events_services_add_provider.helpers({
  initialData() {
    if (editId.get()) {
      return {
        ...getProvider(editId.get()),
        title: "Edit Provider",
      };
    }
    return { title: "Add Provider" };
  },
});

Template.events_services_add_provider.events({
  "submit #add-new-service-provider"(event, template) {
    event.preventDefault();
    let jq = template.$(event.target);
    let data = jq.serializeObject();
    let serviceId = FlowRouter.getParam("serviceId");
    let eventId = FlowRouter.getParam("id");
    data.eventId = eventId;
    data.serviceId = serviceId;
    data.serviceEndDate = data.serviceStartDate;
    let editing = editId.get();
    let cbText = editing ? "Edited provider details" : "Added provider";
    let cb = (err, res) => {
      if (err) showError(err);
      else {
        showSuccess(cbText);
        jq[0].reset();
        template.$(".modal").modal("close");
      }
    };
    if (editing) {
      mbox.confirm(
        "This will delete all slots and clear bookings! Are you sure",
        (yes) => {
          if (!yes) return;
          data.providerId = editing;
          updateProvider.call(data, cb);
        }
      );
    } else {
      addProviders.call(data, cb);
    }
  },
});
