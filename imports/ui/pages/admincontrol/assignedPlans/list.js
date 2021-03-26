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

Template.agency_assigned_plan.onRendered(function() {
    this.subscribe('admin.agency.list');
});
Template.agency_assigned_plan.helpers({
    agencyList() {
        if(Agencies.find().count() > 0) {
          return Agencies.find();
        }
        else {
          return false;
        }
      },
      remainingCount(a,b){
        if(isNumber(a) && isNumber(b)){
            return a-b;
        }else{
            return "Invalid numbers";
        }    
        
      
    }
});