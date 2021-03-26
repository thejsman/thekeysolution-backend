import { Roles } from "meteor/meteor-roles";

let options = {
  unlessExists: true
};

export const SetupRoles = () => {
  Roles.createRole("superadmin", options);
  Roles.createRole("admin", options);
  Roles.createRole("member", options);
  Roles.createRole("client", options);
  Roles.createRole("freelancer", options);

  Roles.createRole("invite-agency", options);
  Roles.createRole("invite-guest", options);
  Roles.createRole("guests-invite-send", options);
  Roles.createRole("remove-agency-invitation", options);
  Roles.createRole("agency-list", options);
  Roles.createRole("view-agency-invitations", options);
  Roles.createRole("view-packages", options);
  Roles.createRole("airport-list", options);
  Roles.createRole("airlines-list", options);
  Roles.createRole("packages-list", options);
  Roles.createRole("view-assigned-plan", options);

  // //Notification role check
  Roles.createRole("send-notification", options);
  Roles.addRolesToParent("send-notification", "admin");
  Roles.addRolesToParent("send-notification", "member");

  //Downloads section
  Roles.createRole("download-section", options);
  Roles.addRolesToParent("download-section", "admin");
  Roles.addRolesToParent("download-section", "member");

  Roles.createRole("subevents-list", options);
  Roles.addRolesToParent("subevents-list", "member");
  Roles.addRolesToParent("subevents-list", "admin");

  Roles.createRole("subevents-add", options);
  Roles.addRolesToParent("subevents-add", "member");
  Roles.addRolesToParent("subevents-add", "admin");

  Roles.createRole("subevents-delete", options);
  Roles.addRolesToParent("subevents-delete", "admin");
  Roles.addRolesToParent("subevents-delete", "member");

  Roles.createRole("subevents-edit", options);
  Roles.addRolesToParent("subevents-edit", "admin");
  Roles.addRolesToParent("subevents-edit", "member");

  Roles.createRole("food-list", options);
  Roles.createRole("transport-driver-list", options);
  Roles.createRole("transport-vehicle-list", options);

  Roles.createRole("user-list", options);
  Roles.createRole("invite-admin-user", options);
  Roles.createRole("view-user-invitations", options);
  Roles.createRole("change-user-role", options);
  Roles.createRole("remove-admin-invitation", options);

  Roles.createRole("add-events", options);
  Roles.createRole("delete-events", options);
  Roles.createRole("close-events", options);
  Roles.createRole("view-events-list", options);

  Roles.createRole("edit-event", options);
  Roles.addRolesToParent("edit-event", "admin");
  Roles.addRolesToParent("edit-event", "member");
  Roles.addRolesToParent("edit-event", "freelancer");

  Roles.createRole("delete-admin-user", options);
  Roles.addRolesToParent("delete-admin-user", "admin");
  Roles.addRolesToParent("delete-admin-user", "member");

  Roles.createRole("edit-freelancer-events", options);
  Roles.addRolesToParent("edit-freelancer-events", "admin");
  Roles.addRolesToParent("edit-freelancer-events", "member");

  Roles.addRolesToParent("view-events-list", "freelancer");
  Roles.addRolesToParent("view-events-list", "client");
  Roles.addRolesToParent("add-events", "admin");
  Roles.addRolesToParent("add-events", "member");
  Roles.addRolesToParent("delete-events", "admin");
  Roles.addRolesToParent("delete-events", "member");
  Roles.addRolesToParent("view-events-list", "admin");
  Roles.addRolesToParent("view-events-list", "member");

  // Roles.createRole("view-app-settings", options);

  Roles.createRole("view-host-details", options);
  Roles.addRolesToParent("view-host-details", "admin");
  Roles.addRolesToParent("view-host-details", "member");
  Roles.addRolesToParent("view-host-details", "client");

  Roles.createRole("packages-info", options);
  Roles.addRolesToParent("packages-info", "admin");
  Roles.addRolesToParent("packages-info", "member");
  Roles.addRolesToParent("packages-info", "freelancer");
  Roles.addRolesToParent("packages-info", "client");

  Roles.createRole("packages-view", options);
  Roles.addRolesToParent("packages-view", "admin");
  Roles.addRolesToParent("packages-view", "member");
  Roles.addRolesToParent("packages-view", "freelancer");
  Roles.addRolesToParent("packages-view", "client");

  Roles.createRole("packages-add", options);
  Roles.addRolesToParent("packages-add", "admin");
  Roles.addRolesToParent("packages-add", "member");
  Roles.addRolesToParent("packages-add", "freelancer");
  Roles.addRolesToParent("packages-add", "client");

  Roles.createRole("packages-edit", options);
  Roles.addRolesToParent("packages-edit", "admin");
  Roles.addRolesToParent("packages-edit", "member");
  Roles.addRolesToParent("packages-edit", "freelancer");
  Roles.addRolesToParent("packages-edit", "client");

  Roles.createRole("packages-delete", options);
  Roles.addRolesToParent("packages-delete", "admin");
  Roles.addRolesToParent("packages-delete", "member");
  Roles.addRolesToParent("packages-delete", "freelancer");
  Roles.addRolesToParent("packages-delete", "client");

  Roles.createRole("guests-list", options);
  Roles.addRolesToParent("guests-list", "admin");
  Roles.addRolesToParent("guests-list", "member");
  Roles.addRolesToParent("guests-list", "freelancer");
  Roles.addRolesToParent("guests-list", "client");

  Roles.createRole("guest-edit", options);
  Roles.addRolesToParent("guest-edit", "admin");
  Roles.addRolesToParent("guest-edit", "member");
  Roles.addRolesToParent("guest-edit", "freelancer");

  Roles.createRole("guest-delete", options);
  Roles.addRolesToParent("guest-delete", "admin");
  Roles.addRolesToParent("guest-delete", "member");
  Roles.addRolesToParent("guest-delete", "freelancer");

  Roles.createRole("guest-import", options);
  Roles.addRolesToParent("guest-import", "admin");
  Roles.addRolesToParent("guest-import", "member");
  Roles.addRolesToParent("guest-import", "freelancer");

  Roles.createRole("guest-export", options);
  Roles.addRolesToParent("guest-export", "admin");
  Roles.addRolesToParent("guest-export", "member");
  Roles.addRolesToParent("guest-export", "freelancer");

  Roles.createRole("guest-add", options);
  Roles.addRolesToParent("guest-add", "admin");
  Roles.addRolesToParent("guest-add", "member");
  Roles.addRolesToParent("guest-add", "freelancer");

  Roles.createRole("guest-invite", options);
  Roles.addRolesToParent("guest-invite", "admin");
  Roles.addRolesToParent("guest-invite", "member");
  Roles.addRolesToParent("guest-invite", "freelancer");

  Roles.createRole("guest-download", options);
  Roles.addRolesToParent("guest-download", "admin");
  Roles.addRolesToParent("guest-download", "member");
  Roles.addRolesToParent("guest-download", "freelancer");

  Roles.createRole("guest-view-details", options);
  Roles.addRolesToParent("guest-view-details", "admin");
  Roles.addRolesToParent("guest-view-details", "member");
  Roles.addRolesToParent("guest-view-details", "freelancer");

  Roles.createRole("event-view-feature-list", options);
  Roles.addRolesToParent("event-view-feature-list", "admin");
  Roles.addRolesToParent("event-view-feature-list", "member");

  Roles.createRole("view-hotels", options);
  Roles.addRolesToParent("view-hotels", "admin");
  Roles.addRolesToParent("view-hotels", "member");
  Roles.addRolesToParent("view-hotels", "freelancer");

  Roles.createRole("edit-hotels", options);
  Roles.addRolesToParent("edit-hotels", "admin");
  Roles.addRolesToParent("edit-hotels", "member");

  Roles.createRole("delete-hotels", options);
  Roles.addRolesToParent("delete-hotels", "admin");
  Roles.addRolesToParent("delete-hotels", "member");

  Roles.createRole("unreserve-hotel-room", options);
  Roles.addRolesToParent("unreserve-hotel-room", "admin");
  Roles.addRolesToParent("unreserve-hotel-room", "member");
  Roles.addRolesToParent("unreserve-hotel-room", "freelancer");

  Roles.createRole("delete-hotel-booking", options);
  Roles.addRolesToParent("delete-hotel-booking", "admin");
  Roles.addRolesToParent("delete-hotel-booking", "member");
  Roles.addRolesToParent("delete-hotel-booking", "freelancer");

  Roles.createRole("view-flights", options);
  Roles.addRolesToParent("view-flights", "admin");
  Roles.addRolesToParent("view-flights", "member");
  Roles.addRolesToParent("view-flights", "freelancer");

  Roles.createRole("edit-flights", options);
  Roles.addRolesToParent("edit-flights", "admin");
  Roles.addRolesToParent("edit-flights", "member");
  Roles.addRolesToParent("edit-flights", "freelancer");

  Roles.createRole("delete-flights", options);
  Roles.addRolesToParent("delete-flights", "admin");
  Roles.addRolesToParent("delete-flights", "member");
  Roles.addRolesToParent("delete-flights", "freelancer");

  Roles.createRole("delete-flight-booking", options);
  Roles.addRolesToParent("delete-flight-booking", "admin");
  Roles.addRolesToParent("delete-flight-booking", "member");
  Roles.addRolesToParent("delete-flight-booking", "freelancer");

  Roles.createRole("view-gifts", options);
  Roles.addRolesToParent("view-gifts", "admin");
  Roles.addRolesToParent("view-gifts", "member");
  Roles.addRolesToParent("view-gifts", "freelancer");

  Roles.createRole("edit-gifts", options);
  Roles.addRolesToParent("edit-gifts", "admin");
  Roles.addRolesToParent("edit-gifts", "member");
  Roles.addRolesToParent("edit-gifts", "freelancer");

  Roles.createRole("delete-gifts", options);
  Roles.addRolesToParent("delete-gifts", "admin");
  Roles.addRolesToParent("delete-gifts", "member");
  Roles.addRolesToParent("delete-gifts", "freelancer");

  Roles.createRole("edit-gift-booking", options);
  Roles.addRolesToParent("edit-gift-booking", "admin");
  Roles.addRolesToParent("edit-gift-booking", "member");
  Roles.addRolesToParent("edit-gift-booking", "freelancer");

  Roles.createRole("delete-gift-booking", options);
  Roles.addRolesToParent("delete-gift-booking", "admin");
  Roles.addRolesToParent("delete-gift-booking", "member");
  Roles.addRolesToParent("delete-gift-booking", "freelancer");

  Roles.createRole("view-transport", options);
  Roles.addRolesToParent("view-transport", "admin");
  Roles.addRolesToParent("view-transport", "member");
  Roles.addRolesToParent("view-transport", "freelancer");

  Roles.createRole("edit-transport", options);
  Roles.addRolesToParent("edit-transport", "admin");
  Roles.addRolesToParent("edit-transport", "member");
  Roles.addRolesToParent("edit-transport", "freelancer");

  Roles.createRole("delete-transport", options);
  Roles.addRolesToParent("delete-transport", "admin");
  Roles.addRolesToParent("delete-transport", "member");
  Roles.addRolesToParent("delete-transport", "freelancer");

  Roles.createRole("edit-transport-booking", options);
  Roles.addRolesToParent("edit-transport-booking", "admin");
  Roles.addRolesToParent("edit-transport-booking", "member");
  Roles.addRolesToParent("edit-transport-booking", "freelancer");

  Roles.createRole("delete-transport-booking", options);
  Roles.addRolesToParent("delete-transport-booking", "admin");
  Roles.addRolesToParent("delete-transport-booking", "member");
  Roles.addRolesToParent("delete-transport-booking", "freelancer");

  Roles.createRole("view-managers", options);
  Roles.addRolesToParent("view-managers", "admin");
  Roles.addRolesToParent("view-managers", "member");
  Roles.addRolesToParent("view-managers", "freelancer");

  Roles.createRole("edit-managers", options);
  Roles.addRolesToParent("edit-managers", "admin");
  Roles.addRolesToParent("edit-managers", "member");
  Roles.addRolesToParent("edit-managers", "freelancer");

  Roles.createRole("delete-managers", options);
  Roles.addRolesToParent("delete-managers", "admin");
  Roles.addRolesToParent("delete-managers", "member");
  Roles.addRolesToParent("delete-managers", "freelancer");

  Roles.createRole("view-services", options);
  Roles.addRolesToParent("view-services", "admin");
  Roles.addRolesToParent("view-services", "member");
  Roles.addRolesToParent("view-services", "freelancer");

  Roles.createRole("edit-services", options);
  Roles.addRolesToParent("edit-services", "admin");
  Roles.addRolesToParent("edit-services", "member");
  Roles.addRolesToParent("edit-services", "freelancer");

  Roles.createRole("delete-services", options);
  Roles.addRolesToParent("delete-services", "admin");
  Roles.addRolesToParent("delete-services", "member");
  Roles.addRolesToParent("delete-services", "freelancer");

  Roles.createRole("edit-services-booking", options);
  Roles.addRolesToParent("edit-services-booking", "admin");
  Roles.addRolesToParent("edit-services-booking", "member");
  Roles.addRolesToParent("edit-services-booking", "freelancer");

  Roles.createRole("delete-services-booking", options);
  Roles.addRolesToParent("delete-services-booking", "admin");
  Roles.addRolesToParent("delete-services-booking", "member");
  Roles.addRolesToParent("delete-services-booking", "freelancer");

  Roles.createRole("view-preferences", options);
  Roles.addRolesToParent("view-preferences", "admin");
  Roles.addRolesToParent("view-preferences", "member");
  Roles.addRolesToParent("view-preferences", "freelancer");

  Roles.createRole("edit-itinerary", options);
  Roles.addRolesToParent("edit-itinerary", "admin");
  Roles.addRolesToParent("edit-itinerary", "member");

  Roles.createRole("delete-itinerary", options);
  Roles.addRolesToParent("delete-itinerary", "admin");
  Roles.addRolesToParent("delete-itinerary", "member");

  Roles.createRole("edit-destination", options);
  Roles.addRolesToParent("edit-destination", "admin");
  Roles.addRolesToParent("edit-destination", "member");

  Roles.createRole("delete-destination", options);
  Roles.addRolesToParent("delete-destination", "admin");
  Roles.addRolesToParent("delete-destination", "member");

  Roles.createRole("add-speaker", options);
  Roles.addRolesToParent("add-speaker", "admin");
  Roles.addRolesToParent("add-speaker", "member");

  Roles.createRole("edit-speaker", options);
  Roles.addRolesToParent("edit-speaker", "admin");
  Roles.addRolesToParent("edit-speaker", "member");

  Roles.createRole("delete-speaker", options);
  Roles.addRolesToParent("delete-speaker", "admin");
  Roles.addRolesToParent("delete-speaker", "member");

  Roles.createRole("add-sponsor", options);
  Roles.addRolesToParent("add-sponsor", "admin");
  Roles.addRolesToParent("add-sponsor", "member");

  Roles.createRole("edit-sponsor", options);
  Roles.addRolesToParent("edit-sponsor", "admin");
  Roles.addRolesToParent("edit-sponsor", "member");

  Roles.createRole("delete-sponsor", options);
  Roles.addRolesToParent("delete-sponsor", "admin");
  Roles.addRolesToParent("delete-sponsor", "member");

  Roles.addRolesToParent("invite-agency", "superadmin");
  Roles.addRolesToParent("invite-guest", "superadmin");
  Roles.addRolesToParent("guests-invite-send", "superadmin");
  Roles.addRolesToParent("remove-agency-invitation", "superadmin");
  Roles.addRolesToParent("agency-list", "superadmin");
  Roles.addRolesToParent("view-agency-invitations", "superadmin");
  Roles.addRolesToParent("view-packages", "superadmin");
  Roles.addRolesToParent("airport-list", "superadmin");
  Roles.addRolesToParent("airlines-list", "superadmin");
  Roles.addRolesToParent("delete-events", "superadmin");
  Roles.addRolesToParent("view-assigned-plan", "superadmin");

  Roles.addRolesToParent("close-events", "admin");
  Roles.addRolesToParent("close-events", "member");
  Roles.addRolesToParent("user-list", "admin");
  Roles.addRolesToParent("user-list", "member");

  Roles.addRolesToParent("invite-admin-user", "admin");
  Roles.addRolesToParent("invite-admin-user", "member");

  Roles.addRolesToParent("guests-invite-send", "admin");
  Roles.addRolesToParent("guests-invite-send", "member");
  Roles.addRolesToParent("guests-invite-send", "freelancer");

  Roles.addRolesToParent("remove-admin-invitation", "admin");
  Roles.addRolesToParent("remove-admin-invitation", "member");

  Roles.addRolesToParent("view-user-invitations", "admin");
  Roles.addRolesToParent("view-user-invitations", "member");

  Roles.addRolesToParent("change-user-role", "admin");
  // Roles.addRolesToParent('change-user-role', 'member');

  Roles.addRolesToParent("invite-guest", "admin");
  Roles.addRolesToParent("invite-guest", "member");
  Roles.addRolesToParent("invite-guest", "freelancer");

  Roles.addRolesToParent("packages-list", "admin");
  Roles.addRolesToParent("packages-list", "member");

  Roles.addRolesToParent("food-list", "admin");
  Roles.addRolesToParent("food-list", "member");

  Roles.addRolesToParent("transport-driver-list", "admin");
  Roles.addRolesToParent("transport-driver-list", "member");
  Roles.addRolesToParent("transport-driver-list", "freelancer");

  Roles.addRolesToParent("transport-vehicle-list", "admin");
  Roles.addRolesToParent("transport-vehicle-list", "member");
  Roles.addRolesToParent("transport-vehicle-list", "freelancer");

  Roles.addRolesToParent("admin", "superadmin");

  Roles.createRole("feature-bank", options);
  Roles.addRolesToParent("feature-bank", "superadmin");

  Roles.createRole("add-feature", options);
  Roles.addRolesToParent("add-feature", "superadmin");

  Roles.createRole("edit-feature", options);
  Roles.addRolesToParent("edit-feature", "superadmin");

  Roles.createRole("delete-feature", options);
  Roles.addRolesToParent("delete-feature", "superadmin");

  Roles.createRole("add-plans", options);
  Roles.addRolesToParent("add-plans", "superadmin");

  Roles.createRole("delete-plans", options);
  Roles.addRolesToParent("delete-plans", "superadmin");

  Roles.createRole("edit-plans", options);
  Roles.addRolesToParent("edit-plans", "superadmin");

  Roles.createRole("add-modules", options);
  Roles.addRolesToParent("add-modules", "superadmin");

  Roles.createRole("edit-modules", options);
  Roles.addRolesToParent("edit-modules", "superadmin");

  Roles.createRole("delete-modules", options);
  Roles.addRolesToParent("delete-modules", "superadmin");

  Roles.createRole("agency-subscription", options);
  Roles.addRolesToParent("agency-subscription", "admin");

  Roles.createRole("agency-orders", options);
  Roles.addRolesToParent("agency-orders", "admin");
  Roles.addRolesToParent("agency-orders", "member");

  Roles.createRole("add-orders", options);
  Roles.addRolesToParent("add-orders", "admin");

  Roles.createRole("edit-orders", options);
  Roles.addRolesToParent("edit-orders", "admin");

  Roles.createRole("delete-orders", options);
  Roles.addRolesToParent("delete-orders", "admin");

  Roles.createRole("update-agency", options);
  Roles.addRolesToParent("update-agency", "admin");

  Roles.createRole("activity-record-insert", options);
  Roles.addRolesToParent("activity-record-insert", "admin");
  Roles.addRolesToParent("activity-record-insert", "member");

  Roles.createRole("activity-record-list", options);
  Roles.addRolesToParent("activity-record-list", "superadmin");

  Roles.createRole("activity-record-delete", options);
  Roles.addRolesToParent("activity-record-delete", "superadmin");

  Roles.createRole("activity-export", options);
  Roles.addRolesToParent("activity-export", "superadmin");
  Roles.addRolesToParent("activity-export", "admin");
  Roles.addRolesToParent("activity-export", "member");

  Roles.createRole("activity-record-based-on-event", options);
  Roles.addRolesToParent("activity-record-based-on-event", "superadmin");
  Roles.addRolesToParent("activity-record-based-on-event", "admin");
  Roles.addRolesToParent("activity-record-based-on-event", "member");
  Roles.addRolesToParent("activity-record-based-on-event", "freelancer");

  Roles.createRole("activity-record-based-on-event-export", options);
  Roles.addRolesToParent("activity-record-based-on-event-export", "superadmin");
  Roles.addRolesToParent("activity-record-based-on-event-export", "admin");
  Roles.addRolesToParent("activity-record-based-on-event-export", "member");
  Roles.addRolesToParent("activity-record-based-on-event-export", "freelancer");
};
