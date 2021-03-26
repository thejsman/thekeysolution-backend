import SimpleSchema from "simpl-schema";

export const DownloadSectionSchema = new SimpleSchema({
  downloadId: { type: String, optional: true },
  eventId: String,
  name: String,
  description: String,
  sections: Object,
  'sections._id': { type: String, optional: true},
  'sections.index': { type: String, optional: true},
  'sections.name': { type: String, optional: true }
});