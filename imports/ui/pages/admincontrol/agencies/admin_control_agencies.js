// Time-stamp: 2017-08-15
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : admin_control_agencies.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { addAgencyInvitation, cancelAgencyInvitation,resendAgencyInvitation } from '../../../../api/adminusers/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { AdminInvitations } from '../../../../api/adminusers/invitations.js';
import { Agencies } from '../../../../api/agencies/agencies.js';
import { Packages } from '../../../../api/packages/packages.js';
import { Events } from '../../../../api/events/events.js';
import './admin_control_agencies.scss';
import './admin_control_agencies.html';
import { Plans } from '../../../../api/plans/plans.js';
import { Modules } from '../../../../api/modules/modules.js';
import { Module } from 'module';

let currentCancellationId = new ReactiveVar();
let cancelModal = new ReactiveVar();
let allPlans=new ReactiveVar();
let selectedPlanId=new ReactiveVar();
let listOfnumOfApps=new ReactiveVar([]);
let allModules=new ReactiveVar();
Template.control_agency_list.onRendered(function() {
  this.subscribe('admin.agency.list');
});

Template.control_agency_list.helpers({
  agencyProfilePath(agency) {

  },
  agencyList() {
    if(Agencies.find().count() > 0) {
      return Agencies.find();
    }
    else {
      return false;
    }
  },

  eventsCount(agency) {
    let events = Events.find({ 'basicDetails.agency': agency });

    return events.count();
  },

  userCount(agency) {
    return Meteor.users.find({
      "roles.scope": agency,
      "roles._id": {
	$in: ['admin', 'client', 'freelancer', 'member']
      }
    }).count();
  },

  requested(agency) {
    let events = Events.find({ 'basicDetails.agency': agency, appRequested: true });

    return events.count();
  },

  eventsPath(agency) {
    return FlowRouter.path('events.list', {}, { agency });
  },

  eventsRequestedPath(agency) {
    return FlowRouter.path('events.list', {}, { agency , appRequested: true });
  },

  userPath(agency) {
    return FlowRouter.path('admin.control.users', {}, {agency});
  }
});

Template.invited_agency_list.onRendered(function() {
  this.subscribe('admin.agency.invitations');
});

Template.invited_agency_list.helpers({
  hasInvitations() {
    return AdminInvitations.find().count() > 0;
  },
  invitedAgencyList() {
    console.log(AdminInvitations.find().fetch());
    return AdminInvitations.find();
  }
});

Template.invited_agency_item.events({
  'click .click_cancel-invitation-button'(event, template) {
    currentCancellationId.set(template.data.info._id);
    cancelModal.get().modal('open');
  },
  'click .click_resend-invitation-button'(event, template) {
    event.preventDefault();
    console.log(this.info.token);
    console.log(this.info);
    resendAgencyInvitation.call(this.info, (err, res) => {
      if(err) {
  showError(err.toString());
      }
      else {
  showSuccess("Invited agency");
      }
    });
  }
});

Template.invite_agency_button.onRendered(function() {
  this.subscribe('packages.all');
  this.subscribe('plans.all');
  this.subscribe('modules.all');
  this.$('.modal').modal();
  this.$('select').material_select();

});

Template.invite_agency_button.helpers({
  getPackages(){
    var pack = Packages.find();
    console.log(pack)
    return pack;
  },
agencyPlans(){
  console.log('all plans',Plans.find({}).fetch());
  $('select').material_select();
  return Plans.find({}).fetch();
},
agencyModules(){
  console.log('all modules',Modules.find({}).fetch());
  $('select').material_select();
  return Modules.find({}).fetch();
},
agencyPlansNoOfApp(){
  console.log('list111',listOfnumOfApps);

  if(listOfnumOfApps.curValue && listOfnumOfApps.curValue.length>0){
    console.log('list',listOfnumOfApps);
  
    return listOfnumOfApps.curValue;
  }else{
    return [];
  }
  
}


});

Template.invite_agency_button.events({
  'click .inAgbtn'(event,template){
    Meteor.setTimeout(() => {
      $('select').material_select();
    }, 500);
  },
  'submit #invite-agency'(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
// ABL SAM BOC
    console.log('raaw',data);
    if(typeof data.agencyPlanId =='undefined' || data.agencyPlanId==""){
      showError('Select a initial plan for agency!');
      return;
    }
    if(typeof data.agencyPlanNumOfAppsPurchased =='undefined' || data.agencyPlanNumOfAppsPurchased==""){
      showError('Select a no. of app purchased for agency!');
      return;
    }
    if(typeof data.agencyModules !='undefined' && data.agencyModules.length>0){
      data.assignedModuleInfo=data.agencyModules.filter(v=>v!="");
      delete data.agencyModules;
    }
    data.assignedPlanInfo={};
    data.assignedPlanInfo.planId=data.agencyPlanId;
    data.assignedPlanInfo.appCount=data.agencyPlanNumOfAppsPurchased;
    delete data.agencyPlanId;
    delete data.agencyPlanNumOfAppsPurchased;
    console.log('final submit',data);
  
// ABL SAM EOC

    addAgencyInvitation.call(data, (err, res) => {
      if(err) {
	showError(err.toString());
      }
      else {
	showSuccess("Invited agency");
	template.$('.modal').modal('close');
	template.$(event.target)[0].reset();
      }
    });
  },
  'change #agencyPlanId'(event,template){
    selectedPlanId=$('#agencyPlanId').val();
    if(selectedPlanId){
      let plan=Plans.findOne({_id:selectedPlanId});
      console.log('selected plan',plan);
      if(plan && plan.planMinNumOfApp && plan.planMaxNumOfApp){
        
        let temp_list=[];
        var option_html='';
        for(var i=plan.planMinNumOfApp;i<=plan.planMaxNumOfApp;i++){
          temp_list.push(i);
          option_html+='<option value="'+i+'">'+i+'</option>';
        }
        $('#agencyPlanNumOfAppsPurchased').html(option_html);
        $('select').material_select();
        listOfnumOfApps.set(temp_list);
      }
    }
  }
});

Template.cancel_invitation_button.onRendered(function() {
  var modal = this.$('.modal');
  modal.modal();
  cancelModal.set(modal);
});

Template.cancel_invitation_button.events({
  'click .click_cancel-button'(event, template) {
    cancelModal.get().modal('close');
    cancelAgencyInvitation.call(currentCancellationId.get(), (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("Invitation revoked");
      }
    });
  }
});
