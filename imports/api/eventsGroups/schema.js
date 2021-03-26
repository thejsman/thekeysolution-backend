import SimpleSchema from 'simpl-schema';

export const EventsGroupsSchema = new SimpleSchema({
  createdBy: String,
  groupName: String,
  eventId: String,
  members: { type: Array }
});