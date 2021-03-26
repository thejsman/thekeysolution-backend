import { Meteor } from 'meteor/meteor';
import { Events } from '../events/events.js';
import { Roles } from 'meteor/meteor-roles';

export default function hasPermission (userId, role) {
  let user = Meteor.users.findOne(userId);
  console.log(user);
  if(!user) return false;

  if(user.allowedEvents && user.allowedEvents.length > 0) {
    for(var i = 0; i < user.allowedEvents.length; i++) {
      let event = Events.findOne(user.allowedEvents[i]);
      if(event) {
        let allowed = Roles.userIsInRole(userId, role, event.basicDetails.agency);
        if(allowed) {
          return allowed;
        }
      }
    }

  }
  let isSuper = Roles.userIsInRole(userId, role);

  if(isSuper) return isSuper;

  let scopes = Roles.getScopesForUser(userId);

  console.log(scopes);

  for(var p = 0; p < scopes.length; p++) {
    if(Roles.userIsInRole(userId, role, scopes[p])) {
      return true;
    }
  }
  return false;
}
