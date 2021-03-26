import SimpleSchema from 'simpl-schema';

export const SpeakerSchema = new SimpleSchema({
  speakerId : { type : String, optional : true},
  eventId: { type: String },
  sequence: { type: Number },
  name: { type: String},
  intro: { type: String, optional : true },
  about: { type: String, optional : true },
  image: { type: String, optional : true }
});