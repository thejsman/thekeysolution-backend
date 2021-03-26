import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { EventsGroupsSchema } from './schema.js'
import { EventsGroups } from './eventsGroups'
import { Roles } from 'meteor/meteor-roles'
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

export const insertEventsGroups = new ValidatedMethod({
  name: "EventsGroups.methods.insert",
  validate: EventsGroupsSchema.validator({
    clean: true
  }),
  run(newEventsGroups) {
    EventsGroups.insert(newEventsGroups)
  }
})


export const deleteEventsGroups = new ValidatedMethod({
  name: "EventsGroups.methods.delete",
  validate: null,
  run(id) {
    if (!isAllowed(this.userId, 'delete-eventsGroups')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS")
    }
    
    const user = Meteor.user();
    EventsGroups.remove(id);

    const activityInsertData = {
      activityModule: 'EventsGroups',
      activitySubModule: 'EventsGroups',
      event: 'delete',
      activityMessage: 'EventsGroups is deleted by ' + user.profile.name + ', userId: ' + user._id
    }
    activityRecordInsert(activityInsertData)
  }
})