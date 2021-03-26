import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";
import { Services } from "../../../../api/services/services.js";
import { ReactiveVar } from "meteor/reactive-var";
import "./events_services.scss";
import "./events_services.html";

Template.events_services.onRendered(function () {
  this.$(".tooltipped").tooltip({ delay: 50 });
  this.subscribe("services.event", FlowRouter.getParam("id"));
});

Template.events_services.helpers({
  serviceAddPath() {
    return FlowRouter.path("events.services.add", {
      id: FlowRouter.getParam("id"),
    });
  },

  serviceList() {
    return Services.find({
      hide: {
        $ne: true,
      },
    });
  },
});

Template.events_single_service.onCreated(function () {
  this.total = new ReactiveVar(0);
  this.available = new ReactiveVar(0);
  this.booked = new ReactiveVar(0);
});

Template.events_single_service.helpers({
  total() {
    let service = this.service;
    let total = 0;
    if (service.providers) {
      service.providers.forEach((p) => {
        total += p.totalSlots;
      });
    }
    return total;
  },
  available() {
    let service = this.service;
    let total = 0;
    let booked = 0;
    if (service.providers) {
      service.providers.forEach((p) => {
        total += p.totalSlots;
        booked += p.bookedSlots ? p.bookedSlots : 0;
      });
    }
    return total - booked;
  },
  booked() {
    let service = this.service;
    let booked = 0;
    if (service.providers) {
      service.providers.forEach((p) => {
        booked += p.bookedSlots ? p.bookedSlots : 0;
      });
    }
    return booked;
  },
});

Template.events_single_service.events({
  click(event, template) {
    FlowRouter.go("events.services.info", {
      id: FlowRouter.getParam("id"),
      serviceId: template.data.service._id,
    });
  },
});
