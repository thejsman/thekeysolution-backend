import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { UpdatedAgency } from './updatedAgency.js';
import { UpdatedAgencySchema } from './schema.js';
import { Agencies } from '../agencies/agencies.js';
import { Roles } from 'meteor/meteor-roles';
import { HasRole } from '../../extras/hasRole.js';

export const insertUpdatedAgency = new ValidatedMethod({
  name: "UpdatedAgency.methods.insert",
  validate: UpdatedAgencySchema.validator({ clean: true }),
  run(agencyNew) {
    if(Roles.hasRole(this.userId, 'agency-subscription')) {
      UpdatedAgency.insert(agencyNew);
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

export const updateAgency = new ValidatedMethod({
  name: "Agencies.methods.update",
  validate: UpdatedAgencySchema.validator({ clean: true }),
  run(agencyUpdate) {
    if(HasRole(this.userId, 'update-agency')) {
      console.log('data of agency',agencyUpdate);
      console.log('in update agency');
      if(typeof agencyUpdate.planPurchaseDateTime !='undefined' && typeof agencyUpdate.agencyModule != 'undefined' && agencyUpdate.agencyModule.legth>0){
        let oldAgency=Agencies.findOne({_id:agencyUpdate.agencyId});
        agencyUpdate.agencyModule.forEach((element,index) => {
          agencyUpdate.agencyModule[index].agencyModuleNumOfModulesUsed=0;
          
        });
        if(typeof oldAgency.agencyModule != 'undefined' && oldAgency.agencyModule.length>0){
          oldAgency.agencyModule.forEach(function(element){
            agencyUpdate.agencyModule.push(element);
          });
        }
        
      }
      Agencies.update(agencyUpdate.agencyId, {
         $set: agencyUpdate
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

/* export const updateUpdatedAgency = new ValidatedMethod({
  name: "UpdatedAgency.methods.update",
  validate: UpdatedAgencySchema.validator({ clean: true }),
  run(agencyUpdate) {
    if(Roles.hasRole(this.userId, 'agency-subscription')) {
      UpdatedAgency.update(agencyUpdate.agencyId, {
  $set: agencyUpdate
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
}); */