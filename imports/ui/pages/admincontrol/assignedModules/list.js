import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { Agencies } from '../../../../api/agencies/agencies.js';
import { Plans } from '../../../../api/plans/plans.js';
import { Modules } from '../../../../api/modules/modules.js';
import './list.scss';
import './list.html';
import { isNumber } from 'util';
let increment=0;

Template.agency_assigned_module.onRendered(function() {
    increment=0;
    this.subscribe('admin.agency.list');

});
Template.agency_assigned_module.helpers({
    agencyList() {
        if(Agencies.find().count() > 0) {
          return Agencies.find();
        }
        else {
          return false;
        }
      },
      moduleRemainingCount(module){
            console.log(module);
            let total=0;
            let used=0;
        if(typeof module.agencyModuleNumOfModulesPurchased != 'undefined'){
            total=module.agencyModuleNumOfModulesPurchased;
        }
        if(typeof module.agencyModuleNumOfModulesUsed != 'undefined'){
            used=module.agencyModuleNumOfModulesUsed;
        }
      return total-used;
    }
    ,
    getIncrement(i){
        increment=increment+i;
        return increment;
    }
});