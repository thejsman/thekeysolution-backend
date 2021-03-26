import SimpleSchema from 'simpl-schema';

export const PhotoSharedBySchema = new SimpleSchema({
  photoId: String,
  guestId: String,
});