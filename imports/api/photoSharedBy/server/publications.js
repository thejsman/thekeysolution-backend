import { Meteor } from 'meteor/meteor';
import { PhotoSharedBy } from '../photoSharedBy';

Meteor.publish('photoLikedBy.list', function(id) {
  return PhotoSharedBy.find({
    _id: id
  });
});