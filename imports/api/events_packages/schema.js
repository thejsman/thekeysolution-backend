import SimpleSchema from "simpl-schema";

export const EventPackagesSchema = new SimpleSchema({
  eventId: {
    type: String,
    optional: false,
  },
  packageName: {
    type: String,
    optional: false,
  },
  packageType: {
    type: String,
    optional: false,
  },
  packageSequence: {
    type: Number,
    optional: false,
  },
  packageInventory: {
    type: Number,
    optional: false,
  },
  packageCurrency: {
    type: "String",
    optional: false,
  },
  packagePrice: {
    type: Number,
    optional: false,
  },
  packageGst: {
    type: Number,
    optional: false,
  },
  description: {
    type: String,
    optional: false,
  },
  msg: {
    type: String,
    optional: false,
  },
});

export const EventPackageInfoSchema = new SimpleSchema({
  eventId: {
    type: String,
    optional: false,
  },
  eventName: {
    type: String,
    optional: false,
  },
  start_date: {
    type: String,
    optional: false,
  },
  end_date: {
    type: String,
    optional: false,
  },
  host_details: {
    type: String,
    optional: false,
  },
  packagesInfo_aboutPage: {
    type: String,
    optional: true,
  },
  banner_img: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: false,
  },
  venue: {
    type: String,
    optional: true,
  },
  terms: {
    type: String,
    optional: true,
  },
  include_speaker: {
    type: Boolean,
    defaultValue: false,
    optional: true,
  },
  include_sponsor: {
    type: Boolean,
    defaultValue: false,
    optional: true,
  },
  address: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  "address.$.building": {
    type: String,
    optional: true,
  },
  "address.$.street": {
    type: String,
    optional: true,
  },
  "address.$.street2": {
    type: String,
    optional: true,
  },
  "address.$.city": {
    type: String,
    optional: true,
  },
  "address.$.state": {
    type: String,
    optional: true,
  },
  "address.$.pin": {
    type: String,
    optional: true,
  },
  "address.$.country": {
    type: String,
    optional: true,
  },
  "address.$.mapurl": {
    type: String,
    optional: true,
  },
  "address.$.lat": {
    type: String,
    optional: true,
  },
  "address.$.lng": {
    type: String,
    optional: true,
  },
});
