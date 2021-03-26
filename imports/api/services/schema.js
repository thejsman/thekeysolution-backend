// Time-stamp: 2017-07-31
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import SimpleSchema from "simpl-schema";

export const ServicesSchema = new SimpleSchema({
  eventId: String,
  serviceId: {
    type: String,
    optional: true,
  },
  serviceName: String,
  serviceDescription: String,
});

export const ServiceBookingSchema = new SimpleSchema({
  guestId: String,
  serviceId: String,
  serviceDate: String,
  serviceTime: String,
  bookingId: { type: String, optional: true },
});

export const ServiceProviderSchema = new SimpleSchema({
  serviceEndDate: String,
  serviceEndTime: String,
  serviceProviderContact: String,
  serviceStartDate: String,
  serviceStartTime: String,
  singleServiceSlot: { type: SimpleSchema.Integer, min: 1 },
  serviceNoOfProviders: { type: SimpleSchema.Integer, min: 1 },
  serviceId: String,
  providerId: { type: String, optional: true },
  eventId: String,
});
