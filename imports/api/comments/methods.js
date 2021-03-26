import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Photos } from '../../api/photo_share/photo_share'
import { CommentsSchema } from './schema.js'
import { Comments } from './comments'
import { Roles } from 'meteor/meteor-roles';
import activityRecordInsert from '../../../utils/activityRecordInsert';

const isAllowed = (userId, role) => {
  let scopes = Roles.getScopesForUser(userId)
  if (scopes.length > 0) {
    for (var i = 0; i < scopes.length; i++) {
      if (Roles.userIsInRole(userId, role, scopes[i])) {
        return true
      }
    }
    return false
  }
  return Roles.userIsInRole(userId, role)
}

export const insertComment = new ValidatedMethod({
  name: "Comments.methods.insert",
  validate: CommentsSchema.validator({
    clean: true
  }),
  run(newComment) {
    var photo = Photos.findOne({
      _id: newComment.photoId
    })

    if (photo) {
      Comments.insert(newComment)
    } else {
      throw new Meteor.Error("Photo Id Invalid")
    }
  }
})

export const commentOnComment = new ValidatedMethod({
  name: "Comments.methods.reply",
  validate: CommentsSchema.validator({
    clean: true
  }),
  run(newComment) {
    var comment = Comments.findOne({
      _id: newComment.parentCommentId
    })

    if (comment) {
      Comments.insert(newComment)
    } else {
      throw new Meteor.Error("Parent Comment Id is Invalid")
    }
  }
})


export const deleteComment = new ValidatedMethod({
  name: "Comments.methods.delete",
  validate: null,
  run(id) {
    if (!isAllowed(this.userId, 'delete-comment')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS")
    }

    const user = Meteor.user();
    Comments.remove(id);

    const activityInsertData = {
      activityModule: 'Guests',
      activitySubModule: 'Comments',
      event: 'delete',
      activityMessage: 'Comment is deleted by ' + user.profile.name + ', userId: ' + user._id
    }
    activityRecordInsert(activityInsertData)
  }
})