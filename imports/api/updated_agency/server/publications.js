import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/meteor-roles';
import { UpdatedAgency } from '../updatedAgency.js'; 
 
Meteor.publish('updated_agency.all', function(id) {
  return UpdatedAgency.find({});
});
