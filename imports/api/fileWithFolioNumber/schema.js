import SimpleSchema from "simpl-schema";

const schema = new SimpleSchema({
  eventId: String,
  guestId: String,
  folioNumber: Number,
  url: String,
  sections: Array,
  subSectionId: {type: String, optional: true},
});

export const FileWithFolioNumberSchema = schema.extend({
  updatedAt : {type: String, optional: true},
  createdBy : {type: String, optional: true}
});

export const notifyGuestSchema = new SimpleSchema({
  data: schema,
  sendNotification: Boolean,
  sendEmail: Boolean
});