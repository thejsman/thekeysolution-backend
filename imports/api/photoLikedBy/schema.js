import SimpleSchema from 'simpl-schema';

export const PhotoLikedBySchema = new SimpleSchema({
  photoId: String,
  guestId: String,
  eventId: String,
});