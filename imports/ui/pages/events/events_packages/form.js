import "./form.html";
import { FlowRouter } from "meteor/kadira:flow-router";
import { ReactiveVar } from "meteor/reactive-var";
import SimpleMDE from "simplemde";
import { EventPackages } from "../../../../api/events_packages/event_packages";
import { Events } from '../../../../api/events/events';
import {
  insertPackage,
  updatePackage
} from "../../../../api/events_packages/methods";
import { showError, showSuccess } from '../../../components/notifs/notifications';
import { rsvpSubEvents } from "../../../../api/subevents/methods";
import _ from "lodash/lodash";
import currencies from "../../../../extras/currencies";

let subeventList = new ReactiveVar([]);

Template.eventPackageForm.onCreated(function() {
  this.packageType = new ReactiveVar("main");
  this.editing = new ReactiveVar(false);
  this.additionalPackagesRoutes = [
    "eventsPackagesAdditional",
    "eventsPackagesAdditionalAdd",
    "eventsPackagesAdditionalEdit"
  ];

  this.editRoutes = ["eventsPackagesEdit", "eventsPackagesAdditionalEdit"];
  this.currentRoute = FlowRouter.current().route.name;

  this.autorun(() => {
    this.subscribe("packages.event", FlowRouter.getParam("id"));
    this.subscribe("events.one", FlowRouter.getParam("id"));

    if (_.includes(this.additionalPackagesRoutes, this.currentRoute)) {
      this.packageType.set("additional");
    } else {
      this.packageType.set("main");
    }

    if (_.includes(this.editRoutes, this.currentRoute)) {
      this.editing.set(true);
      let packageInfo = EventPackages.findOne({
        eventId: FlowRouter.getParam("id"),
        _id: FlowRouter.getParam("packageId")
      });
      $("#packageCurrency").val(packageInfo && packageInfo.packageCurrency);
    } else {
      this.editing.set(false);
    }
  });
});

Template.eventPackageForm.onRendered(function() {
    /**
   * SimpleMDE Setup Starts here ...
   */
  this.packageDescription = new SimpleMDE({
    element: $("#description")[0],
    toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'clean-block', 'link', '|', 'preview', 'side-by-side', 'fullscreen', '|', 'guide'],
  })
  this.attendeeMsg = new SimpleMDE({
    element: $("#msg")[0],
    toolbar: ['bold', 'italic', 'heading', '|', 'quote', 'unordered-list', 'ordered-list', '|', 'clean-block', 'link', '|', 'preview', 'side-by-side', 'fullscreen', '|', 'guide'],
  })
  window.packageDescription = this.packageDescription
  window.attendeeMsg = this.attendeeMsg

  this.autorun(() => {
    this.$("select").material_select();

    if (_.includes(this.editRoutes, this.currentRoute)) {
      this.editing.set(true);
      let packageInfo = EventPackages.findOne({
        eventId: FlowRouter.getParam("id"),
        _id: FlowRouter.getParam("packageId")
      });

      $("#packageCurrency").val(packageInfo && packageInfo.packageCurrency);
    } else {
      this.editing.set(false);
    }

    if (_.includes(this.additionalPackagesRoutes, this.currentRoute)) {
      this.packageType.set("additional");
    } else {
      this.packageType.set("main");
    }
  });

  // Sub events list
  let eId = FlowRouter.getParam("id");
  rsvpSubEvents.call(eId, (err, res) => {
    if (err) {
      console.log(err);
    } else if (!res.single && res.data) {
      let events = _.map(res.data, (s, d) => {
        let ids = _.map(s, "_id");
        return {
          subEventTitle: d,
          subEventId: _.join(ids, ",")
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
          subEventId: _.join(ids, ",")
        };
      });
      subeventList.set(events);
    } else {
      console.log("No SubEvents");
    }
  });
});

Template.eventPackageForm.helpers({
  buttonText: () => {
    const instance = Template.instance();
    return instance.editing.get() ? 'Update Package' : 'Add Package';
  },

  title: () => {
    const instance = Template.instance();
    return instance.editing.get() ? 'Update Package' : 'Add New Package';
  },

  info: () => {
    const instance = Template.instance();
    if(instance.editing.get()) {
      return EventPackages.findOne({
        eventId: FlowRouter.getParam("id"),
        _id: FlowRouter.getParam("packageId")
      });
    }

    return "";
  },

  currencies: () => {
    return currencies;
  },

  subeventsList: () => {
    return subeventList.get();
  },

  invitationBy: () => {
    let event = Events.findOne(FlowRouter.getParam("id"));
    return event && event.basicDetails.eventSubeventSorting;
  },

  isMainPackage: () => {
    const instance = Template.instance();
    return instance.packageType.get() === "main" ? true : false;
  }
});

Template.eventPackageForm.events({
  "submit #eventPackageForm": (e, template) => {
    e.preventDefault();
    const packageType = template.packageType.get();
    const eventId = FlowRouter.getParam("id");
    let data = template.$(e.target).serializeObject();
    data.eventId = eventId;
    data.packageType = packageType;
    
    if (template.editing.get()) {
      data.packageId = FlowRouter.getParam("packageId");
      updatePackage.call(data, (err, res) => {
        if (err) showError(err);
        else {
          if (packageType === "additional") {
            FlowRouter.go("eventsPackagesAdditional", {
              id: FlowRouter.getParam("id")
            });
          } else {
            FlowRouter.go("eventsPackages", { id: FlowRouter.getParam("id") });
          }
          showSuccess("Package Updated");
        }
      });
    } else {
      insertPackage.call(data, (err, res) => {
        if (err) showError(err);
        else {
          if (packageType === "additional") {
            FlowRouter.go("eventsPackagesAdditional", {
              id: FlowRouter.getParam("id")
            });
          } else {
            FlowRouter.go("eventsPackages", { id: FlowRouter.getParam("id") });
          }
          showSuccess("New Package Added");
        }
      });
    }
  }
});
