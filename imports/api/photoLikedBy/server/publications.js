import { Meteor } from 'meteor/meteor';
import { PhotoLikedBy } from '../photoLikedBy';

Meteor.publish('photoLikedBy.list', function(id) {
  return PhotoLikedBy.find({
    _id: id
  });
});