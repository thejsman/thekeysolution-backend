import { FlowRouter } from "meteor/kadira:flow-router";
import { BlazeLayout } from "meteor/kadira:blaze-layout";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";

// ===========================   V2  ===================================
import "../../ui/components/navbar/top_navbar.js";

// layouts
import "../../ui/layouts/body.js";
import "../../ui/layouts/app_home/app_home.js";
import "../../ui/layouts/app_admin/admin_layout.js";
import "../../ui/layouts/admin_home/admin_home.js";
import "../../ui/layouts/admin_control_home/admin_control_layout.js";
import "../../ui/layouts/invite_layout/invite_layout.js";
import "../../ui/layouts/event_layout/event_layout.js";

// Public Pages
import "../../ui/pages/footer/footer.js";

// Admin pages
import "../../ui/pages/apipage/apipage.js";

import "../../ui/pages/loginpage/loginpage.js";
import "../../ui/pages/adminlanding/admin_landing.js";
import "../../ui/pages/admincontrol/admin_control_landing.js";
import "../../ui/pages/admincontrol/profile/admin_user_profile.js";
import "../../ui/pages/admincontrol/agencies/admin_control_agencies.js";
import "../../ui/pages/admincontrol/users/admin_control_users.js";
import "../../ui/pages/admincontrol/airports/airports_page.js";
import "../../ui/pages/admincontrol/airlines/airlines_page.js";
import "../../ui/pages/admincontrol/packages/packages_page.js";
import "../../ui/pages/invites/invite_agency.js";
import "../../ui/pages/invites/invite_user.js";
import "../../ui/pages/events/events_list/events_list.js";

// Events Pages
import "../../ui/pages/events/events_add/events_add.js";
import "../../ui/pages/events/events_summary/events_summary.js";

// Guest Pages
import "../../ui/pages/events/events_guests/events_guests.js";
import "../../ui/pages/events/events_guests/events_guest_add.js";
import "../../ui/pages/events/events_guests/events_guests_upload.js";
import "../../ui/pages/events/events_guests/events_guest_profile.js";
import "../../ui/pages/events/events_guests/events_guest_profile.js";

// Meeting Pages
import "../../ui/pages/events/events_meetings/events_meeting_manage";
import "../../ui/pages/events/events_meetings/events_meeting_detail";

//Flight
import "../../ui/pages/events/events_flights/events_flights.js";
import "../../ui/pages/events/events_flights/events_flights_add.js";
import "../../ui/pages/events/events_flights/events_flights_bulk_upload.js";
import "../../ui/pages/events/events_flightsforsale/events_flightsforsale.js";
import "../../ui/pages/events/events_flightsforsale/events_flightsforsale_add.js";
import "../../ui/pages/events/events_activity/events_activity.js";

//admincontrol
import "../../ui/pages/admincontrol/plans/plans_page.js";
import "../../ui/pages/admincontrol/plans_list/plan_list.js";
import "../../ui/pages/admincontrol/plans_edit/plans_edit.js";

import "../../ui/pages/admincontrol/modules_list/module_list.js";
import "../../ui/pages/admincontrol/modules/modules_page.js";
import "../../ui/pages/admincontrol/modules_edit/modules_edit.js";

import "../../ui/pages/admincontrol/assignedPlans/list.js";
import "../../ui/pages/admincontrol/assignedModules/list.js";

import "../../ui/pages/admincontrol/feature_bank/feature_bank_page.js";

import "../../ui/pages/admincontrol/subscription/subscription.js";
import "../../ui/pages/admincontrol/subscription/payment_success.js";

import "../../ui/pages/admincontrol/orders/order_list.js";
import "../../ui/pages/admincontrol/orders/order_detail.js";

import "../../ui/pages/admincontrol/activity_record/activity_record.js";

import "../../ui/pages/events/events_hotels/events_hotels.js";
import "../../ui/pages/events/events_hotels/events_hotels_add.js";
import "../../ui/pages/events/events_hotelsforsale/events_hotelsforsale.js";
import "../../ui/pages/events/events_hotelsforsale/events_hotelsforsale_add.js";
import "../../ui/pages/events/events_hotelsforsale/events_hotelsforsale_details.js";
import "../../ui/pages/events/events_hotels/events_hotels_details.js";

import "../../ui/pages/events/events_gifts/events_gifts.js";
import "../../ui/pages/events/events_transport/events_transport.js";
import "../../ui/pages/events/events_managers/events_managers.js";
import "../../ui/pages/events/events_subevent/events_subevent.js";

import "../../ui/pages/events/events_services/events_services.js";
import "../../ui/pages/events/events_services/events_services_add.js";
import "../../ui/pages/events/events_services/events_services_details.js";

import "../../ui/pages/events/events_app/events_app.js";

import "../../ui/pages/events/events_foods/events_foods.js";
import "../../ui/pages/events/events_rooms/events_rooms.js";
import "../../ui/pages/events/events_sizes/events_sizes.js";
import "../../ui/pages/events/events_assistances/events_assistances.js";
import "../../ui/pages/events/events_ticket/events_ticket.js";
import "../../ui/pages/events/events_email/events_email.js";
import "../../ui/pages/events/download";
import "../../ui/pages/events/events_notifications/events_notifications.js";

// polls
import "../../ui/pages/events/polls";

// new guest page
import "../../ui/pages/events/events_guest2/events_guest2.js";
import "../../ui/pages/events/photo_share/photo_share.js";
import "../../ui/pages/events/events_app/sponsors/sponsors.js";
import "../../ui/pages/events/events_app/speakers/speakers.js";
import "../../ui/pages/events/events_packages/events_packages.js";

// Reports pages
import "../../ui/pages/reports/reports_logedin.js";
import "../../ui/pages/reports/report_meal_pref.js";
import "../../ui/pages/reports/report_rsvp_info.js";
import "../../ui/pages/reports/report_special_assist.js";
import "../../ui/pages/reports/report_merchandise.js";
import "../../ui/pages/reports/report_flights";
import "../../ui/pages/reports/report_flights_arrival";
import "../../ui/pages/reports/report_flights_departure";

import "../../ui/pages/reports/report_hotels";
import "../../ui/pages/reports/report_password";
import "../../ui/pages/reports/report_service_info.js";

import { updateOrder } from "../../api/orders/methods.js";
import {
  showError,
  showSuccess,
} from "../../ui/components/notifs/notifications.js";
import { updateAgency } from "../../api/updated_agency/methods.js";

// =================================================================

BlazeLayout.setRoot("body");

FlowRouter.route("/webhook", {
  name: "webhook",
  title: "",
  action: function (params, queryParams) {
    if (params.status == "Credit") {
      updateAgency.call(orderdata, (err, res) => {
        if (err) {
          showError(err);
        } else {
          showSuccess("Agency Updated");
        }
      });
    }
    submitdata = {
      agencyOrderStatus: params.status,
      agencyPaymentId: params.paymentId,
      agencyPaymentRequestId: params.paymentRequestId,
    };
    updateOrder.call(submitdata, (err, res) => {
      if (err) {
        showError(err);
        console.log("Payment error");
      } else {
        showSuccess("Payment Success");
      }
    });
    return 200;
  },
});

// Set up all routes in the app
FlowRouter.route("/apipage", {
  name: "app.api",
  title: "",
  action() {
    BlazeLayout.render("app_body2", {
      main: "app_home2",
      content: "api_template",
    });
  },
});

FlowRouter.route("/", {
  name: "app.home",
  title: "",
  action() {
    BlazeLayout.render("app_body2", {
      main: "app_home2",
      content: "login_page",
    });
  },
});

FlowRouter.notFound = {
  action() {
    BlazeLayout.render("app_body2", { main: "app_notFound" });
  },
};

// before login routes
const publicRoutes = FlowRouter.group({
  name: "public",
  prefix: "/public",
  triggersEnter: [publicRedirect],
});

publicRoutes.route("/invite/agency/:token", {
  name: "invite.agency",
  action() {
    BlazeLayout.render("app_body2", {
      main: "app_home2",
      content: "invite_layout",
      main_content: "invite_agency_page",
    });
  },
});

publicRoutes.route("/invite/admin-user/:token", {
  name: "invite.admin",
  action() {
    BlazeLayout.render("app_body2", {
      main: "app_home2",
      content: "invite_layout",
      main_content: "invite_user_page",
    });
  },
});

function publicRedirect(context, redirect) {}

// Admin auth triggers
function onEnterAuth(context, redirect) {
  if (!Meteor.user() && !Meteor.loggingIn()) {
    var route = FlowRouter.current();
    if (route.route.name !== "app.home") {
      Session.set("redirectAfterLogin", route.path);
    }
    redirect("app.home");
  }
}

// Start the admin routes definitions
var adminRoutes = FlowRouter.group({
  // prefix: '/admin',
  name: "admin",
  triggersEnter: [onEnterAuth],
});

adminRoutes.route("/", {
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_home2",
      content: "admin_landing",
    });
  },
});

// About
adminRoutes.route("/about-us", {
  name: "key.about",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      content: "about_us",
      admin_content: "admin_control_layout",
    });
  },
});

adminRoutes.route("/contact-us", {
  name: "key.contact",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      content: "contact_us",
      admin_content: "admin_control_layout",
    });
  },
});

adminRoutes.route("/terms-and-conditions", {
  name: "key.tnc",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      content: "our_terms",
      admin_content: "admin_control_layout",
    });
  },
});

adminRoutes.route("/privacy-policy", {
  name: "key.privacy",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      content: "privacy_policy",
      admin_content: "admin_control_layout",
    });
  },
});

adminRoutes.route("/end-user-licence-aggreement", {
  name: "key.eula",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      content: "eula",
      admin_content: "admin_control_layout",
    });
  },
});

adminRoutes.route("/refund-policy", {
  name: "key.refund",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      content: "refund_policy",
      admin_content: "admin_control_layout",
    });
  },
});

adminRoutes.route("/delivery-policy", {
  name: "key.delivery",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      content: "delivery_policy",
      admin_content: "admin_control_layout",
    });
  },
});
//=================== ADMIN USERS ROUTES ======================================//

var adminControlRoutes = adminRoutes.group({
  name: "admin.control",
  prefix: "/control",
});

adminControlRoutes.route("/", {
  name: "admin.control.landing",
  title: "Admin",
  parent: "app.home",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "admin_control_landing",
    });
  },
});

adminControlRoutes.route("/profile", {
  name: "admin.control.profile",
  title: "Admin",
  parent: "app.home",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "admin_user_profile",
    });
  },
});

adminControlRoutes.route("/agencies", {
  name: "admin.control.agencies",
  title: "Agencies",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "admin_control_agencies_page",
    });
  },
});

adminControlRoutes.route("/users", {
  name: "admin.control.users",
  title: "Users",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "admin_control_users_page",
    });
  },
});

adminControlRoutes.route("/airports", {
  name: "admin.control.airports",
  title: "Airports",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "airports_page",
    });
  },
});

adminControlRoutes.route("/airlines", {
  name: "admin.control.airlines",
  title: "Airlines",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "airlines_page",
    });
  },
});

adminControlRoutes.route("/packages", {
  name: "admin.control.packages",
  title: "Packages",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "packages_page",
    });
  },
});

adminControlRoutes.route("/plan/add", {
  name: "admin.control.plan.add",
  title: "Add plan",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "plans_page",
    });
  },
});

adminControlRoutes.route("/plan/edit/:planId", {
  name: "admin.control.plan.edit",
  title: "Edit plan",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "plans_edit",
    });
  },
});

adminControlRoutes.route("/plan", {
  name: "admin.control.plan",
  title: "Plan",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "plan_list_page",
    });
  },
});

adminControlRoutes.route("/module", {
  name: "admin.control.module",
  title: "Module",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "module_list_page",
    });
  },
});

adminControlRoutes.route("/module/add", {
  name: "admin.control.module.add",
  title: "Add module",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "modules_page",
    });
  },
});

adminControlRoutes.route("/module/edit/:moduleId", {
  name: "admin.control.module.edit",
  title: "Edit module",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "modules_edit_page",
    });
  },
});

adminControlRoutes.route("/feature", {
  name: "admin.control.feature",
  title: "Feature bank",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "feature_bank_page",
    });
  },
});
adminControlRoutes.route("/assignedPlans", {
  name: "admin.control.assignedPlans",
  title: "Assigned Plans",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "agency_assigned_plan",
    });
  },
});
adminControlRoutes.route("/assignedModules", {
  name: "admin.control.assignedModules",
  title: "Assigned Modules",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "agency_assigned_module",
    });
  },
});

adminControlRoutes.route("/subscription", {
  name: "admin.control.subscription",
  title: "My Subscription",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "agency_subscription",
    });
  },
});

adminControlRoutes.route("/order", {
  name: "admin.control.order",
  title: "My Orders",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "order_list_page",
    });
  },
});

adminControlRoutes.route("/order/detail/:orderId", {
  name: "admin.control.order.detail",
  title: "Order Detail",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "order_detail_page",
    });
  },
});

adminControlRoutes.route("/payment_success", {
  name: "admin.control.payment_success",
  title: "Payment Success",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "payment_success",
    });
  },
});

adminControlRoutes.route("/activity", {
  name: "admin.control.activity_record",
  title: "Activity Record",
  parent: "admin.control.landing",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "activity_record_page",
    });
  },
});

/* adminControlRoutes.route('/payment', {
  name: 'admin.control.payment',
  title: 'Payment',
  parent: 'admin.control.landing',
  action() {

    BlazeLayout.render('app_body2', {
      main: 'admin_layout',
      admin_content: 'admin_control_layout',
      content: 'data_form'
    });
  }
}); */

//=================== EVENT ROUTES ======================================//
var eventRoutes = adminRoutes.group({
  prefix: "/events",
  name: "events",
  title: "Events",
});

eventRoutes.route("/", {
  name: "events.list",
  title: "events",
  parent: "app.home",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "events_list",
    });
  },
});

// TODO: remove add events when create events page completes
// add new event
eventRoutes.route("/add", {
  name: "events.add",
  title: "Event Add",
  parent: "events.list",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "admin_control_layout",
      content: "events_add",
    });
  },
});

// add new event
eventRoutes.route("/create", {
  name: "events.create",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_home",
      admin_content: "events_create",
    });
  },
});

// ================= EVENT DETAILS =====================================//
// event details
var eventDetails = eventRoutes.group({
  prefix: "/:id",
  name: "events.details",
});

eventDetails.route("/", {
  name: "events.summary",
  parent: "events.list",
  title: "summary",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_summary",
    });
  },
});

// Download Section
eventDetails.route("/downloads", {
  name: "events.download",
  parent: "events.list",
  title: "downloads",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "downloadSection",
    });
  },
});

eventDetails.route("/downloads/agency", {
  name: "events.download.agency",
  parent: "events.list",
  title: "agency downloads",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "agencyDownload",
    });
  },
});

eventDetails.route("/downloads/add", {
  name: "events.download.add",
  parent: "events.download",
  title: "add section",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "downloadForm",
    });
  },
});

eventDetails.route("/downloads/:downloadId/view", {
  name: "events.download.view",
  parent: "events.download",
  title: "view downloads",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "viewDownload",
    });
  },
});

eventDetails.route("/downloads/:downloadId/edit", {
  name: "events.download.edit",
  parent: "events.download",
  title: "edit section",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "downloadForm",
    });
  },
});

// event activity SOB
eventDetails.route("/activity", {
  name: "events.activity",
  parent: "events.list",
  title: "activity",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "event_dashboard_activity_record",
    });
  },
});

eventDetails.route("/activity/pwa", {
  name: "events.activity.pwa",
  parent: "events.list",
  title: "activity",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "event_pwa_activity_record",
    });
  },
});

// event guests
eventDetails.route("/guests", {
  name: "events.guest",
  parent: "events.list",
  title: "guests",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_guests",
    });
  },
});

// event guests
eventDetails.route("/guest2", {
  name: "events.guest2",
  parent: "events.list",
  title: "guests",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_guest2",
    });
  },
});

eventDetails.route("/guests/add", {
  name: "events.guest.add",
  parent: "events.guest",
  title: "Add Guest",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_guest_add",
    });
  },
});

eventDetails.route("/guests/upload", {
  name: "events.guest.upload",
  parent: "events.guest",
  title: "Upload Guests",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_guests_upload",
    });
  },
});

// event flights
eventDetails.route("/flights", {
  name: "events.flight",
  parent: "events.list",
  title: "Flights",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_flights",
    });
  },
});

eventDetails.route("/flights/add", {
  name: "events.flight.add",
  parent: "events.flight",
  title: "Flight-Add",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_flights_add",
    });
  },
});

eventDetails.route("/flights/bulk-upload", {
  name: "events.flight.upload",
  parent: "events.flight",
  title: "Flights Bulk Upload",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_flights_bulk_upload",
    });
  },
});

eventDetails.route("/flightsforsale", {
  name: "events.flightforsale",
  parent: "events.list",
  title: "Flights",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_flightsforsale",
    });
  },
});

eventDetails.route("/flightsforsale/add", {
  name: "events.flightforsale.add",
  parent: "events.flightforsale",
  title: "Flight For Sale -Add",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_flightsforsale_add",
    });
  },
});

// event hotels
eventDetails.route("/hotels", {
  name: "events.hotel",
  parent: "events.list",
  title: "Hotels",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_hotels",
    });
  },
});

// event add new hotel
eventDetails.route("/hotels/add", {
  name: "events.hotel.add",
  parent: "events.hotel",
  title: "Hotel-Add",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_hotels_add",
    });
  },
});

// event single hotel
eventDetails.route("/hotels/info/:hotelId", {
  name: "events.hotel.info",
  parent: "events.hotel",
  title: "Hotel-Info",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_hotels_details",
    });
  },
});

// event hotels
eventDetails.route("/hotelsforsale", {
  name: "events.hotelforsale",
  parent: "events.list",
  title: "Hotels For Sale",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_hotelsforsale",
    });
  },
});

// event add new hotel
eventDetails.route("/hotelsforsale/add", {
  name: "events.hotelforsale.add",
  parent: "events.hotelforsale",
  title: "Hotel For Sale -Add",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_hotelsforsale_add",
    });
  },
});

// event single hotel
eventDetails.route("/hotelsforsale/info/:hotelId", {
  name: "events.hotelforsale.info",
  parent: "events.hotelforsale",
  title: "Hotel For Sale -Info",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_hotelsforsale_details",
    });
  },
});

// event gifts
eventDetails.route("/gift", {
  name: "events.gift",
  parent: "events.list",
  title: "Gifts",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_gifts",
    });
  },
});

// Email Setting
eventDetails.route("/email", {
  name: "events.email",
  parent: "events.list",
  title: "Email",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_email",
    });
  },
});

// Polls
eventDetails.route("/polls", {
  name: "events.poll",
  parent: "events.list",
  title: "Polls",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_polls",
    });
  },
});

eventDetails.route("/polls/view/:pollId", {
  name: "events.poll.view",
  parent: "events.poll",
  title: "poll info",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_poll_view",
    });
  },
});

eventDetails.route("/polls/update/:pollId", {
  name: "events.poll.update",
  parent: "events.poll",
  title: "poll info",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_polls_form",
    });
  },
});

eventDetails.route("/polls/add", {
  name: "events.poll.add",
  parent: "events.poll",
  title: "create new",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_polls_form",
    });
  },
});

// Tickets
eventDetails.route("/tickets", {
  name: "events.ticket",
  parent: "events.list",
  title: "Tickets",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_ticket",
    });
  },
});

eventDetails.route("/tickets/add", {
  name: "events.ticket.add",
  parent: "events.ticket",
  title: "New Ticket",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_ticket_add",
    });
  },
});

// TODO : Make this route dynamic
eventDetails.route("/tickets/info", {
  name: "events.ticket.info",
  parent: "events.ticket",
  title: "Ticket Info",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_ticket_info",
    });
  },
});

eventDetails.route("/tickets/info/inclusion", {
  name: "events.ticket.inclusion",
  parent: "events.ticket.info",
  title: "Ticket Inclusion",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "ticket_inclusion",
    });
  },
});

eventDetails.route("/transport", {
  name: "events.transport",
  parent: "events.list",
  title: "transport",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_transport",
    });
  },
});

eventDetails.route("/managers", {
  name: "events.managers",
  parent: "events.list",
  title: "Managers",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_managers",
    });
  },
});

// Photo sharing UI
eventDetails.route("/photos", {
  name: "events.photos",
  parent: "events.list",
  title: "Photos",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "photo_share",
    });
  },
});

eventDetails.route("/photos/edit/:photoId", {
  name: "events.photos.single",
  parent: "events.photos",
  title: "Edit Photo",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "photo_form",
    });
  },
});

eventDetails.route("/photos/new", {
  name: "events.photos.new",
  parent: "events.photos",
  title: "Add Photo",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "photo_form",
    });
  },
});

eventDetails.route("/photos/settings", {
  name: "events.photos.settings",
  parent: "events.photos",
  title: "Photos",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "photo_share_settings",
    });
  },
});

// Events Packages section

// Package Info
eventDetails.route("/packages/info", {
  name: "eventsPackagesInfo",
  parent: "eventsPackages",
  title: "Basic Info",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_packages_info",
    });
  },
});

// Main Packages
eventDetails.route("/packages", {
  name: "eventsPackages",
  parent: "events.list",
  title: "Packages",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_packages",
    });
  },
});

eventDetails.route("/packages/main/add", {
  name: "eventsPackagesAdd",
  parent: "eventsPackages",
  title: "Add New Package",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "eventPackageForm",
    });
  },
});

eventDetails.route("/packages/main/:packageId", {
  name: "eventsPackagesEdit",
  parent: "eventsPackages",
  title: "Update Package Info",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "eventPackageForm",
    });
  },
});

// Additional Packages
eventDetails.route("/packages/additional", {
  name: "eventsPackagesAdditional",
  parent: "events.list",
  title: "Additional Packages",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_packages",
    });
  },
});

eventDetails.route("/packages/additional/add", {
  name: "eventsPackagesAdditionalAdd",
  parent: "eventsPackagesAdditional",
  title: "Add New Package",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "eventPackageForm",
    });
  },
});

eventDetails.route("/packages/additional/:packageId", {
  name: "eventsPackagesAdditionalEdit",
  parent: "eventsPackagesAdditional",
  title: "Update Package Info",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "eventPackageForm",
    });
  },
});

// End of Packages section

eventDetails.route("/subevents", {
  name: "events.subevents",
  parent: "events.app",
  title: "Subevents",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_subevent",
    });
  },
});

eventDetails.route("/subevents/add", {
  name: "events.subevents.add",
  parent: "events.subevents",
  title: "Add Subevent",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_subevent_add",
    });
  },
});

eventDetails.route("/subevents/:subEventId", {
  name: "events.subevents.edit",
  parent: "events.subevents",
  title: "Edit Subevent",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_subevent_add",
    });
  },
});


//meetings
eventDetails.route("/managemeeting", {
  name: "events.meetings",
  title: "Meeting",
  parent: "events.list",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_meeting_manage",
    });
  },
});

eventDetails.route("/managemeeting/add", {
  name: "addEventMeeting",
  parent: "events.meetings",
  title: "Add Meeting",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "addmeetingForm",
    });
  },
});

eventDetails.route("/managemeeting/:meetingId", {
  name: "editEventMeeting",
  parent: "events.meetings",
  title: "Edit Meeting",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "addmeetingForm",
    });
  },
});

eventDetails.route("/managemeeting/info/:meetingId", {
  name: "events.meeting.info",
  parent: "events.meeting",
  title: "Meeting Info",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_meetings_details",
    });
  },
});


//services
eventDetails.route("/services", {
  name: "events.services",
  parent: "events.list",
  title: "Services",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_services",
    });
  },
});
// event add services
eventDetails.route("/services/add", {
  name: "events.services.add",
  parent: "events.services",
  title: "Services-Add",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_services_add",
    });
  },
});

// App Settings route
eventDetails.route("/app", {
  name: "events.app",
  parent: "events.list",
  title: "App",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "app_general_settings",
    });
  },
});

// Welcome section
eventDetails.route("/app/welcome", {
  name: "events.app.welcome",
  parent: "events.app",
  title: "App-Welcome",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "app_welcome_settings",
    });
  },
});

// Welcome section
eventDetails.route("/app/generalQueries", {
  name: "events.app.wishfedback",
  parent: "events.app",
  title: "App-General-Queries",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "app_wishfeedback_settings",
    });
  },
});

// About section
eventDetails.route("/app/about", {
  name: "events.app.about",
  parent: "events.app",
  title: "App-About",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "app_about_settings",
    });
  },
});

// About New section
eventDetails.route("/app/about2", {
  name: "events.app.about2",
  parent: "events.app",
  title: "About Info",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_app_about",
    });
  },
});

// Speakers section
eventDetails.route("/app/speakers", {
  name: "events.app.speakers",
  parent: "events.app",
  title: "speakers",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "app_speakers",
    });
  },
});

eventDetails.route("/app/speakers/add", {
  name: "events.app.speakers.add",
  parent: "events.app.speakers",
  title: "Add Speaker",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "add_speaker",
    });
  },
});

eventDetails.route("/app/speakers/:speakerId", {
  name: "events.app.speakers.edit",
  parent: "events.app.speakers",
  title: "Edit Speaker",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "add_speaker",
    });
  },
});

// Sponsors section
eventDetails.route("/app/sponsors", {
  name: "events.app.sponsors",
  parent: "events.app",
  title: "sponsors",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "app_sponsors",
    });
  },
});

eventDetails.route("/app/sponsors/add", {
  name: "events.app.sponsors.add",
  parent: "events.app.sponsors",
  title: "Add Sponsor",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "add_sponsor",
    });
  },
});

eventDetails.route("/app/sponsors/:sponsorId", {
  name: "events.app.sponsors.edit",
  parent: "events.app.sponsors",
  title: "Edit Sponsor",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "add_sponsor",
    });
  },
});

// Contact section
eventDetails.route("/app/contact", {
  name: "events.app.contact",
  parent: "events.app",
  title: "App-Contact",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "app_contact_settings",
    });
  },
});

// Destination section
eventDetails.route("/app/destination", {
  name: "events.app.destination",
  parent: "events.app",
  title: "Destinations",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "app_destination_settings",
    });
  },
});

eventDetails.route("/app/destination/add", {
  name: "events.app.destination.add",
  parent: "events.app.destination",
  title: "Update Destination",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "app_add_destination_settings",
    });
  },
});

// Itinerary section
eventDetails.route("/app/itinerary", {
  name: "events.app.itinerary",
  parent: "events.app",
  title: "App-Itineary",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "app_itinerary_settings",
    });
  },
});

// Notifications section
eventDetails.route("/notifications", {
  name: "events.notifications",
  parent: "events.list",
  title: "Notifications",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "app_notification_settings",
    });
  },
});

eventDetails.route("/notifications/add", {
  name: "addNotification",
  parent: "events.notifications",
  title: "Add Notification",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "notificationForm",
    });
  },
});

eventDetails.route("/notifications/:notificationId", {
  name: "editNotification",
  parent: "events.notifications",
  title: "Edit Notification",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "notificationForm",
    });
  },
});

// App Preview Section
eventDetails.route("/app/finalpreview", {
  name: "events.app.finalpreview",
  parent: "events.app",
  title: "App-Preview",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "app_preview_slideshow",
    });
  },
});

// =======================================================================

eventDetails.route("/services/info/:serviceId", {
  name: "events.services.info",
  parent: "events.services",
  title: "Services-Info",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_services_details",
    });
  },
});

eventDetails.route("/guests/profile/:guestId", {
  name: "events.guest.profile",
  parent: "events.guest",
  title: "Guests-Info",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_guest_profile",
    });
  },
});
eventDetails.route("/foods", {
  name: "events.guest.foods",
  parent: "events.list",
  title: "Food Preferences",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_foods",
    });
  },
});
eventDetails.route("/rooms", {
  name: "events.guest.rooms",
  parent: "events.list",
  title: "Rooms",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_rooms",
    });
  },
});
eventDetails.route("/sizes", {
  name: "events.guest.sizes",
  parent: "events.list",
  title: "Sizes",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_sizes",
    });
  },
});
eventDetails.route("/assistances", {
  name: "events.guest.assistances",
  parent: "events.list",
  title: "assistances",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "events_assistances",
    });
  },
});

// Reports
eventDetails.route("/reports/logedin", {
  name: "events.reports.logedin",
  parent: "events.list",
  title: "Reports",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "reports_logedin",
    });
  },
});

eventDetails.route("/reports/notLogedin", {
  name: "events.reports.notLogedin",
  parent: "events.list",
  title: "Reports",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "reports_logedin",
    });
  },
});

eventDetails.route("/reports/mealPref", {
  name: "events.reports.mealPref",
  parent: "events.list",
  title: "Reports",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "report_meal_pref",
    });
  },
});

eventDetails.route("/reports/rsvpInfo", {
  name: "events.reports.rsvpInfo",
  parent: "events.list",
  title: "Reports",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "report_rsvp_info",
    });
  },
});

eventDetails.route("/reports/specialAssist", {
  name: "events.reports.specialAssist",
  parent: "events.list",
  title: "Reports",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "report_special_assist",
    });
  },
});

eventDetails.route("/reports/merchandise", {
  name: "events.reports.merchandise",
  parent: "events.list",
  title: "Reports",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "report_merchandise",
    });
  },
});

eventDetails.route("/reports/flights", {
  name: "events.reports.flights",
  parent: "events.list",
  title: "Flights Report Master ",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "report_flights",
    });
  },
});
eventDetails.route("/reports/flights/arrival", {
  name: "events.reports.flights.arrival",
  parent: "events.list",
  title: "Flights Report Arrival",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "report_flights_arrival",
    });
  },
});
eventDetails.route("/reports/flights/departure", {
  name: "events.reports.flights.departure",
  parent: "events.list",
  title: "Flights Report Departure",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "report_flights_departure",
    });
  },
});
eventDetails.route("/reports/hotels", {
  name: "events.reports.hotels",
  parent: "events.list",
  title: "Hotels Report",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "report_hotels",
    });
  },
});
eventDetails.route("/reports/password", {
  name: "events.reports.password",
  parent: "events.list",
  title: "Password Report",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "reports_password",
    });
  },
});
eventDetails.route("/reports/serviceInfo", {
  name: "events.reports.serviceInfo",
  parent: "events.list",
  title: "Reports",
  action() {
    BlazeLayout.render("app_body2", {
      main: "admin_layout",
      admin_content: "event_layout",
      content: "report_service_info",
    });
  },
});
