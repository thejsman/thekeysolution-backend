import SimpleSchema from "simpl-schema";

export const EventMeetingGuestInvitationSchema = new SimpleSchema({
  eventmeetingId: { type: String },
  guestId: { type: String },
  invitationSentStatus: { type: String },
  invitationResendCount:  { type: Number },
});
