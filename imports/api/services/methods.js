import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Services, ServiceSlots } from "./services.js";
import { Events } from "../events/events.js";
import {
  ServicesSchema,
  ServiceBookingSchema,
  ServiceProviderSchema,
} from "./schema.js";
import { ServiceBookings } from "./serviceBooking.js";
import _ from "lodash";
import moment from "moment";
import { Guests } from "../guests/guests.js";
import { Roles } from "meteor/meteor-roles";
import { insertActivity } from "../../api/activity_record/methods.js";

let isAllowed = (userId, role) => {
  let scopes = Roles.getScopesForUser(userId);
  console.log(scopes);
  if (scopes.length > 0) {
    for (var i = 0; i < scopes.length; i++) {
      if (Roles.userIsInRole(userId, role, scopes[i])) {
        return true;
      }
    }
    return false;
  }
  return Roles.userIsInRole(userId, role);
};

let func_removeProvider = ({ serviceId, providerId }) => {
  ServiceSlots.remove({ providerId });
  ServiceBookings.remove({ providerId });
  Services.update(serviceId, {
    $pull: {
      providers: {
        _id: providerId,
      },
    },
  });
};

let func_addProvider = (provider) => {
  let service = Services.findOne(provider.serviceId);
  if (!service) {
    throw new Meteor.Error("cannot find service");
  }
  let serviceStartDate = moment(provider.serviceStartDate, "DD MMMM, YYYY");
  let serviceEndDate = moment(provider.serviceEndDate, "DD MMMM, YYYY");
  let days =
    moment.duration(serviceEndDate.diff(serviceStartDate)).asDays() + 1;

  let serviceStartTime = moment(provider.serviceStartTime, "hh:mma");
  let serviceEndTime = moment(provider.serviceEndTime, "hh:mma");

  if (
    serviceStartTime
      .clone()
      .add(provider.singleServiceSlot, "m")
      .isAfter(serviceEndTime)
  ) {
    throw new Meteor.Error(
      "Duration not big enough. Not even one slot can be booked"
    );
  }

  provider._id = Random.id();

  for (var i = 0; i < days; i++) {
    let serviceDate = serviceStartDate.clone().add(i, "d");
    let serviceTime = setDateForMoment(serviceStartTime, serviceDate);
    let endTime = setDateForMoment(serviceEndTime, serviceDate);

    do {
      for (var j = 0; j < provider.serviceNoOfProviders; j++) {
        ServiceSlots.insert({
          providerId: provider._id,
          serviceId: provider.serviceId,
          eventId: provider.eventId,
          serviceDate: serviceTime.format("D MMMM, YYYY"),
          serviceTime: serviceTime.format("hh:mma"),
          utcTime: serviceTime.unix(),
          serviceDuration: provider.singleServiceSlot,
        });
      }
    } while (
      serviceTime.add(provider.singleServiceSlot, "m").isBefore(endTime)
    );
  }

  provider.totalSlots = ServiceSlots.find({ providerId: provider._id }).count();

  Services.update(provider.serviceId, {
    $push: {
      providers: provider,
    },
  });
};

export const insertService = new ValidatedMethod({
  name: "Services.methods.insert",
  validate: ServicesSchema.validator({ clean: true }),
  run(serviceNew) {
    var event = Events.findOne({
      _id: serviceNew.eventId,
    });

    if (event) {
      Services.insert(serviceNew);
    } else {
      throw new Meteor.Error("Event id invalid");
    }
  },
});

export const updateService = new ValidatedMethod({
  name: "Services.methods.update",
  validate: ServicesSchema.validator({ clean: true }),
  run(service) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, "edit-services")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    Services.update(service.serviceId, {
      $set: service,
    });
  },
});

export const updateProvider = new ValidatedMethod({
  name: "Services.methods.providers.update",
  validate: ServiceProviderSchema.validator({ clean: true }),
  run(provider) {
    let service = Services.findOne(provider.serviceId);
    func_addProvider(provider);
    func_removeProvider({
      providerId: provider.providerId,
      serviceId: provider.serviceId,
    });
  },
});

export const addProviders = new ValidatedMethod({
  name: "Services.methods.providers.add",
  validate: ServiceProviderSchema.validator({ clean: true }),
  run(provider) {
    func_addProvider(provider);
  },
});

export const slotCount = new ValidatedMethod({
  name: "slots.fetch.count",
  validate: null,
  run(providerId) {
    return ServiceSlots.find({ providerId }).count();
  },
});

export const removeProvider = new ValidatedMethod({
  name: "services.slots.remove",
  validate: null,
  run({ serviceId, providerId }) {
    func_removeProvider({ serviceId, providerId });
  },
});

function setDateForMoment(m, d) {
  return m.clone().set({
    date: d.date(),
    month: d.month(),
    year: d.year(),
  });
}

//code to insert data in Activity Record
function activityRecordInsert(data) {
  var activityEvent = "";
  var activityEventId = "";
  var activityUserInfo = {
    id: Meteor.userId(),
    name: Meteor.user().profile.name,
    email: Meteor.user().emails[0].address,
  };
  if (data.eventId == null || data.eventId == "" || data.eventId == undefined) {
    activityEvent = "general";
    activityEventId = "general";
  } else {
    var event = Events.findOne(data.eventId);
    activityEvent = event.basicDetails.eventName;
    activityEventId = event._id;
  }
  var date = new Date();
  userdata = {
    activityeDateTime:
      date.getFullYear() +
      "-" +
      date.getMonth() +
      "-" +
      date.getDate() +
      " " +
      date.getHours() +
      ":" +
      date.getMinutes() +
      ":" +
      date.getSeconds() +
      "." +
      date.getMilliseconds(),
    activityUserInfo: activityUserInfo,
    activityModule: data.activityModule,
    activitySubModule: data.activitySubModule,
    activityEvent: activityEvent,
    activityEventId: activityEventId,
    activityMessage: data.activityMessage,
  };
  insertActivity.call(userdata, (err, res) => {
    if (err) {
      console.log("Insert Activity record Error :: ", err);
      return 0;
    } else {
      return true;
    }
  });
}

function calculateSlots(provider, serviceId) {
  var dates = provider.serviceAvailable.split(",");
  _.each(dates, (date) => {
    // console.log(dates);
    // console.log(date);
    var startTimeString = date + " " + provider.serviceStartTime;
    // console.log(startTimeString);
    var endTimeString = date + " " + provider.serviceEndTime;
    // console.log(endTimeString);
    var startTime = moment(startTimeString);
    var duration = moment.duration(provider.singleServiceSlot, "minutes");
    var endTime = moment(endTimeString);
    // console.log(startTime);
    // console.log(duration);
    // console.log(endTime);
    while (startTime.isBefore(endTime)) {
      var slot = {
        serviceId: serviceId,
        providerId: provider._id,
        startTime: startTime.format(),
        duration: provider.singleServiceSlot,
        isAvailable: true,
      };
      // console.log(startTime);
      startTime = startTime.add(duration);
      ServiceSlots.insert(slot);
    }
  });
}

export const removeService = new ValidatedMethod({
  name: "Service.methods.remove",
  validate: null,
  run(serviceId) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, "delete-services")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    ServiceBookings.remove({ serviceId });
    ServiceSlots.remove({ serviceId });
    Services.remove(serviceId);
  },
});

let func_unbookService = (bookingId) => {
  let booking = ServiceBookings.findOne(bookingId);
  let slot = ServiceSlots.findOne(booking.slotId);
  if (booking && slot) {
    ServiceSlots.update(booking.slotId, {
      $set: {
        available: true,
        assignedTo: "",
      },
    });

    Services.update(
      {
        _id: booking.serviceId,
        "providers._id": slot.providerId,
      },
      {
        $inc: {
          "providers.$.bookedSlots": -1,
        },
      }
    );

    let service_delete = ServiceBookings.findOne(bookingId);

    ServiceBookings.remove(bookingId);

    //code to store activity log
    activityInsertData = {
      eventId: service_delete.eventId,
      activityModule: "Guests",
      activitySubModule: "Services",
      event: "delete",
      activityMessage: "Service is deleted for event.",
    };
    activityRecordInsert(activityInsertData);
  } else {
    if (Meteor.isServer) {
      throw new Meteor.Error("Booking not found");
    }
  }
};

export const func_bookService1 = (data) => {
  var success = [];
  var failure = [];
  var deletes = [];

  var finalGuestId = "";
  _.each(data, (booking) => {
    let { guestId, serviceId, serviceDate, serviceTime, deleted } = booking;
    finalGuestId = guestId;
    console.log("booking", booking);
    if (deleted) {
      let service = Services.findOne(serviceId);

      let booked_slot = ServiceBookings.findOne({
        guestId: guestId,
        serviceId: serviceId,
        serviceDate: serviceDate,
        serviceTime: serviceTime,
      });

      if (booked_slot) {
        let slot_id = booked_slot.slotId;
        ServiceBookings.remove(
          {
            guestId: guestId,
            serviceId: serviceId,
            serviceDate: serviceDate,
            serviceTime: serviceTime,
            slotId: slot_id,
          },
          function (err, res) {
            if (res) {
              ServiceSlots.update(
                slot_id,
                {
                  $unset: {
                    available: 1,
                    assignedTo: 1,
                  },
                },
                function (err, succ) {
                  if (succ) {
                    console.log("service . findone update", err, succ);
                    Services.update(
                      {
                        _id: serviceId,
                        "providers._id": booked_slot.providerId,
                      },
                      {
                        $inc: {
                          "providers.$.bookedSlots": -1,
                        },
                      }
                    );
                  }
                }
              );
            }
          }
        );
      }
      deletes.push(serviceId);
    } else {
      let slot = ServiceSlots.findOne({
        serviceId,
        serviceDate,
        serviceTime,
        available: {
          $ne: false,
        },
      });

      if (slot) {
        console.log("slot vavilable");
        delete booking.deleted;
        let service = Services.findOne(serviceId);
        ServiceSlots.update(slot._id, {
          $set: {
            available: false,
            assignedTo: guestId,
          },
        });

        ServiceBookings.insert(
          {
            ...booking,
            serviceName: service.serviceName,
            slotId: slot._id,
            providerId: slot.providerId,
          },
          function (err, result) {
            if (err) {
            } else {
              console.log("result of service booking nsert", result);
              ServiceBookings.remove(
                {
                  guestId: guestId,
                  serviceId: serviceId,
                  serviceDate: serviceDate,

                  slotId: { $nin: [slot._id] },
                },
                function (err, res) {
                  if (err) {
                  } else {
                    console.log("some service removed");
                    ServiceSlots.update(
                      {
                        assignedTo: guestId,
                        serviceId: serviceId,
                        serviceTime: { $nin: [serviceTime] },
                      },
                      {
                        $unset: {
                          available: 1,
                          assignedTo: 1,
                        },
                      },
                      function (err, succ) {
                        console.log("service . findone update", err, succ);
                        if (succ) {
                          Services.update(
                            {
                              _id: serviceId,
                              "providers._id": slot.providerId,
                            },
                            {
                              $inc: {
                                "providers.$.bookedSlots": -1,
                              },
                            }
                          );
                        }
                      }
                    );
                  }
                  console.log("dfs remove service", err, res);
                }
              );
            }
          }
        );

        Services.update(
          {
            _id: serviceId,
            "providers._id": slot.providerId,
          },
          {
            $inc: {
              "providers.$.bookedSlots": 1,
            },
          }
        );

        //code to store activity log

        success.push(serviceId);
        console.log("success ", success);
      } else {
        console.log("slot not available");
        failure.push(serviceId);
        console.log("failure", failure);
        //throw new Meteor.Error("Slot unavailable");
      }
    } //else of deleted
  });
  return { success, failure, deletes, finalGuestId };
};

export const func_bookService = (booking) => {
  let { guestId, serviceId, serviceDate, serviceTime } = booking;
  let slot = ServiceSlots.findOne({
    serviceId,
    serviceDate,
    serviceTime,
    available: {
      $ne: false,
    },
  });

  if (slot) {
    let service = Services.findOne(serviceId);

    ServiceSlots.update(slot._id, {
      $set: {
        available: false,
        assignedTo: guestId,
      },
    });

    ServiceBookings.insert({
      ...booking,
      serviceName: service.serviceName,
      slotId: slot._id,
      providerId: slot.providerId,
    });

    Services.update(
      {
        _id: serviceId,
        "providers._id": slot.providerId,
      },
      {
        $inc: {
          "providers.$.bookedSlots": 1,
        },
      }
    );
    //code to store activity log
    let guests = Guests.findOne(guestId);

    activityInsertData = {
      eventId: "",
      activityModule: "Guests",
      activitySubModule: "Services",
      event: "update",
      activityMessage:
        "Service is updated for guest " +
        guests.guestTitle +
        " " +
        guests.guestFirstName +
        " " +
        guests.guestLastName +
        ".",
    };
    activityRecordInsert(activityInsertData);
  } else {
    throw new Meteor.Error("Slot unavailable");
  }
};

export const unbookService = new ValidatedMethod({
  name: "Services.methods.unbook",
  validate: null,
  run(bookingId) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, "delete-services-booking")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    func_unbookService(bookingId);
  },
});

export const updateBooking = new ValidatedMethod({
  name: "Services.methods.booking.update",
  validate: ServiceBookingSchema.validator({ clean: true }),
  run(booking) {
    // ABL_SAM added Permission Check
    if (!isAllowed(this.userId, "edit-services-booking")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }
    func_unbookService(booking.bookingId);
    func_bookService(booking);
  },
});

export const bookServices = new ValidatedMethod({
  name: "Services.methods.assign",
  validate: ServiceBookingSchema.validator({ clean: true }),
  run(booking) {
    func_bookService(booking);
  },
});
