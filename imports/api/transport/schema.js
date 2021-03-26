import SimpleSchema from 'simpl-schema';

export const TransportBookSchema = new SimpleSchema({
  bookingId: { type: String, optional : true},
  guestId: String,
  eventId: String,
  transportType: String,
  vehicleId: String,
  driverId: String,
  transportStartDate: String,
  transportStartTime: String,
  transportEndDate: String,
  transportEndTime: String,
  transportRemarks: { type: String, optional: true }
});
