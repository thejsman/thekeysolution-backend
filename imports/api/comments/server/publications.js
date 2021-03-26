import { Meteor } from 'meteor/meteor';
import { Comments } from '../comments.js';

Meteor.publish('comments.photoId', function(id) {
  return Comments.find({
    photoId: id
  });
});

Meteor.publish('comments.parentCommentId', function(id) {
  return Comments.find({
    parentCommentId: id
  });
});

Meteor.publish('comments.list', function(id) {
  return Comments.find({
    _id: id
  });
});