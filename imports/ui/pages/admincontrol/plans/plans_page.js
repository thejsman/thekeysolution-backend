import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { Features } from '../../../../api/features/features.js';
import { Plans } from '../../../../api/plans/plans.js';
import { Agencies } from '../../../../api/agencies/agencies.js';
import { insertPlan } from '../../../../api/plans/methods.js';

import './plans_page.scss';
import './plans_page.html';

let planSelectAll = new ReactiveVar(false);

Template.plans_page.onRendered(function() {
  this.subscribe('features.all');
  this.subscribe('admin.agency.list');
    this.autorun(() => {
    let selectAll = planSelectAll.get();
    Meteor.setTimeout(() => {
      this.$('select').material_select();
    }, 100);
  });
});

Template.plans_page.helpers({
  hasFeatures() {
    return Features.find().count() > 0;
  },
  featureList() {
    return Features.find();
  },
   agencyList() {
    if(Agencies.find().count() > 0) {
      console.log('data of agency',Agencies.find().count());
      return Agencies.find();
    }
    else {
      return false;
    }
  },  
});


Template.plans_page.events({
  'submit #plans-page'(event, template) {
    event.preventDefault();
    var target = template.$(event.target);
    var data = target.serializeObject();
  //  template.$(event.target)[0].reset();
    template.$('.modal').modal('close');
    console.log('data to be inserted ', data);
    insertPlan.call(data, (err, res) => { 
      if(err) {
	showError(err);
      }
      else {
	showSuccess("Plan Added");
   template.$(event.target)[0].reset(); 
   FlowRouter.go('admin.control.plan');
      }
    });
  },

   'click #plan_available_for'(event, template) { 
   console.log('event')
   if($('#plan_available_for').prop('checked')){
    $('#agencyList_div').removeClass('hide'); 
   }else{
    $('#agencyList_div').addClass('hide'); 
   }
   

   }

});

