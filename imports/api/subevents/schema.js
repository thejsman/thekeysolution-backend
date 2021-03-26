import SimpleSchema from 'simpl-schema';

export const SubEventSchema = new SimpleSchema({
  eventId: String,
  subeventId: {
    type: String, optional: true
  },
  subEventTitle: String,
  subEventDate: String,
  subEventStartTime: String,
  subEventEndTime: String,
  subEventTab1: {
    type: String, optional: true
  },
  subEventTab1Content: {
    type: String, optional: true
  },
  subEventTab2: {
    type: String, optional: true
  },
  subEventTab2Content: {
    type: String, optional: true
  },
  subEventTab3: {
    type: String, optional: true
  },
  subEventTab3Content: {
    type: String, optional: true
  },
  subEventDestination: String,
  subEventLocation: String,
  subEventLocationLink: String,
  subEventDescription: String,
  subEventImg: {
    type: String, optional: false
  }
});
