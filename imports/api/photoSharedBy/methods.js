import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Photos } from "../../api/photo_share/photo_share";
import { PhotoSharedBySchema } from "./schema.js";
import { PhotoSharedBy } from "./photoSharedBy";
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

// export const likePhotoSharedBy = new ValidatedMethod({
//   name: "PhotoSharedBy.methods.shared",
//   validate: PhotoSharedBySchema.validator({
//     clean: true
//   }),
//   run(newPhotoSharedBy) {
//     var photo = Photos.findOne({
//       _id: newPhotoSharedBy.photoId
//     });

//     if (photo) {
//       PhotoSharedBy.insert(newPhotoSharedBy);
//     }
//   }
// });

// export const unlikePhotoSharedBy = new ValidatedMethod({
//   name: "PhotoSharedBy.methods.unshared",
//   validate: null,
//   run(id) {
//     if (!isAllowed(this.userId, "delete-eventsGroups")) {
//       throw new Meteor.Error("NO PERMISSIONS FOR THIS");
//     }

//     const user = Meteor.user();
//     PhotoSharedBy.remove(id);

//     const activityInsertData = {
//       activityModule: "Photos",
//       activitySubModule: "PhotoSharedBy",
//       event: "delete",
//       activityMessage:
//         "PhotoSharedBy is deleted by " +
//         user.profile.name +
//         ", userId: " +
//         user._id
//     };
//     activityRecordInsert(activityInsertData);
//   }
// });
