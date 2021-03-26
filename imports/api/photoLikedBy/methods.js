import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Photos } from "../../api/photo_share/photo_share";
import { PhotoLikedBySchema } from "./schema.js";
import { PhotoLikedBy } from "./photoLikedBy";
import { Roles } from "meteor/meteor-roles";
import activityRecordInsert from "../../../utils/activityRecordInsert";

const isAllowed = (userId, role) => {
  let scopes = Roles.getScopesForUser(userId);
  if (scopes.length > 0) {
    for (var i = 0; i < scopes.length; i++) {
      if (Roles.userIsInRole(userId, role, scopes[i])) {
        return true;
      }
    }
    return false;
  }
  return Roles.userIsInRole(userId, role);
};

export const likePhotoLikedBy = new ValidatedMethod({
  name: "PhotoLikedBy.methods.like",
  validate: PhotoLikedBySchema.validator({
    clean: true
  }),
  run(newPhotoLikedBy) {
    var photo = Photos.findOne({
      _id: newPhotoSharedBy.photoId
    });

    if (photo) {
      PhotoLikedBy.insert(newPhotoLikedBy);
    }
  }
});

export const unlikePhotoLikedBy = new ValidatedMethod({
  name: "PhotoLikedBy.methods.unlike",
  validate: null,
  run(id) {
    if (!isAllowed(this.userId, "delete-eventsGroups")) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS");
    }

    const user = Meteor.user();
    PhotoLikedBy.remove(id);

    const activityInsertData = {
      activityModule: "Photos",
      activitySubModule: "PhotoLikedBy",
      event: "delete",
      activityMessage:
        "PhotoLikedBy is deleted by " +
        user.profile.name +
        ", userId: " +
        user._id
    };
    activityRecordInsert(activityInsertData);
  }
});
