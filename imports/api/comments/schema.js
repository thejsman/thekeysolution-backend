import SimpleSchema from 'simpl-schema';

export const CommentsSchema = new SimpleSchema({
  photoId: String,
  commentedBy: String,
  commentText: { type: String },
  parentCommentId: { type: String, optional: true, defaultValue: null },
});