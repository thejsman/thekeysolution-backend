import { Roles } from 'meteor/meteor-roles';

export const IsAllowed = (userId, role) => {
  let agencies = Roles.getScopesForUser(userId);
  if(agencies.length > 0) {
    for(var i = 0; i < agencies.length; i++) {
      // this is usually ok since there's only one agency
      if(!Roles.userIsInRole(userId, role, agencies[i])) {
	return false;
      }
    }
    return true;
  }
  else {
    return Roles.userIsInRole(userId, role);
  }
};
