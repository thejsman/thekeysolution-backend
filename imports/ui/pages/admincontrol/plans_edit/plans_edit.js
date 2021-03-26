import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { Features } from '../../../../api/features/features.js';
import { Plans } from '../../../../api/plans/plans.js';
import { Agencies } from '../../../../api/agencies/agencies.js';
import { updatePlan } from '../../../../api/plans/methods.js';

import './plans_edit.scss';
import './plans_edit.html';

var planId = new ReactiveVar();

Template.plans_edit.onRendered(function() {
   var planId = FlowRouter.getParam("planId");
  var sub = this.subscribe('plans.one', planId);
  this.subscribe('admin.agency.list');
  this.subscribe('features.all');
  this.autorun(() => {
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
    $('#editAgencyList').material_select();
   if($('#edit_plan_available_for').prop('checked')){
      $('#plan_edit_agency_list_div').removeClass('hide'); 
   }else{
      $('#plan_edit_agency_list_div').addClass('hide'); 
   }
      }, 100);
   }); 
   this.autorun(() => {
     Meteor.setTimeout(() => {
      var data=Plans.findOne(planId);
       if(data && data.planFeatures && data.planFeatures.length > 0) {
       data.planFeatures.forEach(f => {
        this.$(`[value="${f}"]`).prop('checked', true);
      });
    }
    if(data && data.planAgencyList && data.planAgencyList.length > 0) {
       data.planAgencyList.forEach(f => {
         this.$('#editAgencyList').val(data.planAgencyList);
         this.$('select').material_select();
      });
    }
    }, 500);
   });
}); 

Template.plans_edit.helpers({
  hasFeatures() {
    return Features.find().count() > 0;
  },
  featureList() {
    return Features.find();
  },
  planDetails() {
  var planId = FlowRouter.getParam("planId");
    if(planId) {
      var data=Plans.findOne(planId);
    if(data && data.planFeatures && data.planFeatures.length > 0) {
      data.planFeatures.forEach(f => {
      });
    }
      if(data && data.planIsStatusInactive ) {
       $('#plan_status').attr('checked',true);
     }   

      if(data && data.planIsAvailableForSpecificAgency ) {
       $('#edit_plan_available_for').attr('checked',true);
     }   



 return Plans.findOne(planId);
    }
    else {
      return false;
    }
  },
   agencyList() {
    if(Agencies.find().count() > 0) {
      return Agencies.find();
    }
    else {
      return false;
    }
  },  
});


Template.plans_edit.events({
  'submit #plans-edit-page'(event, template) {
    event.preventDefault();
    var target = template.$(event.target);
    var data = target.serializeObject();
   
     if($('#edit_plan_available_for').prop('checked')==true){
       data.planIsAvailableForSpecificAgency = true;
     }
     else{
       data.planIsAvailableForSpecificAgency = false;
       data.planAgencyList=[];
     }
      if($('#plan_status').prop('checked')==true){
       data.planIsStatusInactive = true;
     }
     else{
       data.planIsStatusInactive = false;
     }
    data.planId=FlowRouter.getParam("planId");
    template.$('.modal').modal('close');
    updatePlan.call(data, (err, res) => { 
      if(err) {
	      showError(err);
      }
      else {
      	showSuccess("Plan Updated");
        template.$(event.target)[0].reset(); 
        FlowRouter.go('admin.control.plan');
      }
    });
  },

   'click #edit_plan_available_for'(event, template) { 

    if($('#edit_plan_available_for').prop('checked')){
    $('#plan_edit_agency_list_div').removeClass('hide'); 
   }else{
    $('#plan_edit_agency_list_div').addClass('hide'); 
   }

   }

});

