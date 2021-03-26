import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/kadira:flow-router";
import "./side_navbar_events.html";
import {
  deleteEvent,
  undeleteEvent,
  countListEvent,
  removeEvent
} from "../../../api/events/methods.js";
// ABL_SAM : To show Error Messages!
import {
  showError,
  showSuccess
} from "../../components/notifs/notifications.js";

import { Events } from "../../../api/events/events.js";
import { ReactiveVar } from "meteor/reactive-var";
import _ from "lodash";

import { App_General } from "../../../api/app_general/app_general";

var CheckElement = ReactiveVar();

Template.side_navbar_events.onRendered(function() {
  this.autorun(() => {
    if (Events.find({}).count() > 0) {
      let event = Events.findOne();
      let elements = [];
      let selectedFeatures = event && event.featureDetails.selectedFeatures;
      let selectedAppDetails = event && event.appDetails.selectedAppDetails;
      let selectedAppPreferences =
        event && event.appDetails.selectedAppPreferences;
      _.map(selectedFeatures, a => {
        elements.push(a);
      });
      _.map(selectedAppDetails, a => {
        elements.push(a);
      });
      _.map(selectedAppPreferences, a => {
        elements.push(a);
      });
      CheckElement.set(elements);
      Meteor.setTimeout(() => {
        self.$(".collapsible").collapsible();
        self.$(".tooltip-icon").tooltip({ delay: 50 });
      }, 1);
    }
  });
});

function hasFeature(featureName) {
  let features = CheckElement.get();
  if (features && features.length > 0) {
    return features.indexOf(featureName) > -1;
  }
  return false;
}

Template.side_navbar_events.helpers({
  eventName() {
    let event = Events.findOne();
    return event ? event.basicDetails.eventName : "";
  },

  closeEventTitle() {
    let event = Events.findOne();
    if (event && event.basicDetails.isEventClose) {
      return "Re-open Event";
    }
    return "Close Event";
  },

  eventHotelExist() {
    return hasFeature("Hotel Booking");
  },

  anyHotelExist() {
    return hasFeature("Hotel Booking") || hasFeature("Hotel Booking Paid");
  },

  eventPaidHotelExist() {
    return hasFeature("Hotel Booking Paid");
  },

  eventFlightExist() {
    return hasFeature("Flight Booking");
  },

  anyFlightExist() {
    return hasFeature("Flight Booking") || hasFeature("Flight Booking Paid");
  },

  eventPaidFlightExist() {
    return hasFeature("Flight Booking Paid");
  },

  eventServicesExist() {
    return hasFeature("Services");
  },

  eventSizeExist() {
    return hasFeature("Size");
  },

  eventSpecialAssistanceExist() {
    return hasFeature("Special Assistance");
  },

  eventTransportExist() {
    return hasFeature("Transport");
  },

  eventGiftsExist() {
    return hasFeature("Gifts");
  },

  eventMealExist() {
    return hasFeature("Meal");
  },

  guestPreferenceExist() {
    return (
      hasFeature("Size") ||
      hasFeature("Meal") ||
      hasFeature("Special Assistance")
    );
  },

  activityRoute() {
    return FlowRouter.path("events.activity", {
      id: FlowRouter.getParam("id")
    });
  },

  activityRoutePwa() {
    return FlowRouter.path("events.activity.pwa", {
      id: FlowRouter.getParam("id")
    });
  },

  eventSummary() {
    return FlowRouter.path("events.summary", { id: FlowRouter.getParam("id") });
  },
  
  guestRoute() {
    return FlowRouter.path("events.guest", { id: FlowRouter.getParam("id") });
  },


  meetingRoute(){
    return FlowRouter.path("events.meetings", { id: FlowRouter.getParam("id") });
  },

  packagesRoute() {
    return FlowRouter.path("eventsPackages", { id: FlowRouter.getParam("id") });
  },
  
  photosRoute() {
    return FlowRouter.path("events.photos", { id: FlowRouter.getParam("id") });
  },
  photoSettingsRoute() {
    return FlowRouter.path("events.photos.settings", {
      id: FlowRouter.getParam("id")
    });
  },
  packagesOptionalRoute() {
    return FlowRouter.path("eventsPackagesAdditional", {
      id: FlowRouter.getParam("id")
    });
  },
  packagesInfoRoute() {
    return FlowRouter.path("eventsPackagesInfo", {
      id: FlowRouter.getParam("id")
    });
  },
  flightRoute() {
    return FlowRouter.path("events.flight", { id: FlowRouter.getParam("id") });
  },

  flightforsaleRoute() {
    return FlowRouter.path("events.flightforsale", {
      id: FlowRouter.getParam("id")
    });
  },

  hotelRoute() {
    return FlowRouter.path("events.hotel", { id: FlowRouter.getParam("id") });
  },
  // ABL : Defining Route for Hotel for Sale Menu
  hotelforsaleRoute() {
    return FlowRouter.path("events.hotelforsale", {
      id: FlowRouter.getParam("id")
    });
  },

  giftRoute() {
    return FlowRouter.path("events.gift", { id: FlowRouter.getParam("id") });
  },

  transportRoute() {
    return FlowRouter.path("events.transport", {
      id: FlowRouter.getParam("id")
    });
  },

  managersRoute() {
    return FlowRouter.path("events.managers", {
      id: FlowRouter.getParam("id")
    });
  },
  subeventRoute() {
    return FlowRouter.path("events.subevents", {
      id: FlowRouter.getParam("id")
    });
  },
  servicesRoute() {
    return FlowRouter.path("events.services", {
      id: FlowRouter.getParam("id")
    });
  },
  foodRoute() {
    return FlowRouter.path("events.guest.foods", {
      id: FlowRouter.getParam("id")
    });
  },
  sizeRoute() {
    return FlowRouter.path("events.guest.sizes", {
      id: FlowRouter.getParam("id")
    });
  },
  roomRoute() {
    return FlowRouter.path("events.guest.rooms", {
      id: FlowRouter.getParam("id")
    });
  },
  ticketRoute() {
    return FlowRouter.path("events.ticket", { id: FlowRouter.getParam("id") });
  },
  assistanceRoute() {
    return FlowRouter.path("events.guest.assistances", {
      id: FlowRouter.getParam("id")
    });
  },
  // App Routes
  appRoute() {
    return FlowRouter.path("events.app", { id: FlowRouter.getParam("id") });
  },
  appSpeakerRoute() {
    return FlowRouter.path("events.app.speakers", {
      id: FlowRouter.getParam("id")
    });
  },
  appSponsorRoute() {
    return FlowRouter.path("events.app.sponsors", {
      id: FlowRouter.getParam("id")
    });
  },
  appWelcomeRoute() {
    return FlowRouter.path("events.app.welcome", {
      id: FlowRouter.getParam("id")
    });
  },
  // ABL SAM : ADD NEW ROUTE FOR APP WISH FEDDBACK SCREEN
  appWishFeedbackRoute() {
    return FlowRouter.path("events.app.wishfedback", {
      id: FlowRouter.getParam("id")
    });
  },
  appAboutRoute() {
    let event = App_General.findOne();
    if (
      (event && event.aboutPageContent) ||
      (event && event.aboutPageImg) ||
      (event && event.aboutPageMainMessage) ||
      (event && event.aboutPageMainbanner) ||
      (event && event.aboutPageTitle)
    ) {
      return FlowRouter.path("events.app.about", {
        id: FlowRouter.getParam("id")
      });
    }
    return FlowRouter.path("events.app.about2", {
      id: FlowRouter.getParam("id")
    });
  },
  appContactRoute() {
    return FlowRouter.path("events.app.contact", {
      id: FlowRouter.getParam("id")
    });
  },
  appDestinationRoute() {
    return FlowRouter.path("events.app.destination", {
      id: FlowRouter.getParam("id")
    });
  },
  appItineraryRoute() {
    return FlowRouter.path("events.app.itinerary", {
      id: FlowRouter.getParam("id")
    });
  },
  appNotificationsRoute() {
    return FlowRouter.path("events.notifications", {
      id: FlowRouter.getParam("id")
    });
  },
  emailRoute() {
    return FlowRouter.path("events.email", { id: FlowRouter.getParam("id") });
  },
  downloadRoute() {
    return FlowRouter.path("events.download", {
      id: FlowRouter.getParam("id")
    });
  },
  downloadRouteAgency() {
    return FlowRouter.path("events.download.agency", {
      id: FlowRouter.getParam("id")
    });
  },
  appPreviewRoute() {
    return FlowRouter.path("events.app.finalpreview", {
      id: FlowRouter.getParam("id")
    });
  },
  pollRoute: () => {
    return FlowRouter.path("events.poll", { id: FlowRouter.getParam("id") });
  },
  hasFeature(featureName) {
    let features = CheckElement.get();
    if (features && features.length > 0) {
      return features.indexOf(featureName) > -1;
    }
    return false;
  },
  reportLogin() {
    return FlowRouter.path("events.reports.logedin", {
      id: FlowRouter.getParam("id")
    });
  },
  reportMealPref() {
    return FlowRouter.path("events.reports.mealPref", {
      id: FlowRouter.getParam("id")
    });
  },
  reportRsvpInfo() {
    return FlowRouter.path("events.reports.rsvpInfo", {
      id: FlowRouter.getParam("id")
    });
  },
  reportSpecialAssist() {
    return FlowRouter.path("events.reports.specialAssist", {
      id: FlowRouter.getParam("id")
    });
  },
  reportMerchandise() {
    return FlowRouter.path("events.reports.merchandise", {
      id: FlowRouter.getParam("id")
    });
  },
  reportFlights() {
    return FlowRouter.path("events.reports.flights", {
      id: FlowRouter.getParam("id")
    });
  },
  reportFlightsArrival() {
    return FlowRouter.path("events.reports.flights.arrival", {
      id: FlowRouter.getParam("id")
    });
  },
  reportFlightsDeparture() {
    return FlowRouter.path("events.reports.flights.departure", {
      id: FlowRouter.getParam("id")
    });
  },
  reportHotels() {
    return FlowRouter.path("events.reports.hotels", {
      id: FlowRouter.getParam("id")
    });
  },
  reportPassword() {
    return FlowRouter.path("events.reports.password", {
      id: FlowRouter.getParam("id")
    });
  },
  reportServiceInfo() {
    return FlowRouter.path("events.reports.serviceInfo", {
      id: FlowRouter.getParam("id")
    });
  }
});

Template.side_navbar_events.events({
  "click .click_delete-event"(event, template) {
    let e = Events.findOne();
    mbox.confirm("Are you sure?", function(yes) {
      if (yes) {
        if (e.basicDetails.isEventClose) {
          undeleteEvent.call(FlowRouter.getParam("id"));
        } else {
          deleteEvent.call(FlowRouter.getParam("id"));
        }
        FlowRouter.go("events.list");
      }
    });
  },

  "click .click_remove-event"(event, template) {
    mbox.confirm("This cannot be undone", function(yes) {
      if (yes) {
        removeEvent.call(FlowRouter.getParam("id"), (err, res) => {
          FlowRouter.go("events.list");
        });
      }
    });
  },
  "click .collapsible-body a"(event, template) {
    template.$(event.target).addClass("selected-li");
    template
      .$(event.target)
      .siblings()
      .removeClass("selected-li");
  }
});
