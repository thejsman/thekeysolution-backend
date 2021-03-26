import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Plans } from '../../../../api/plans/plans.js';
import { deletePlan} from '../../../../api/plans/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';

import './plan_list.scss';
import './plan_list.html';

var deleteModal = null;
var deleteId = new ReactiveVar();
Template.plan_list_page.onRendered(function(){
  this.subscribe('plans.sort');
});

Template.plan_list_page.helpers({
  hasPlans() {
    return Plans.find().count() > 0;
  },
  planList() {
    return Plans.find();
  },
  addPlanRoute() {
     return FlowRouter.path('admin.control.plan.add');
  }, 

});

Template.add_plan_button.helpers({
  addPlanRoute() {
     return FlowRouter.path('admin.control.plan.add');
  }, 

});

Template.plan_details_item.events({
  'click .click_delete-plan-button'(event, template) {
    deleteId.set(template.data.info._id);
    deleteModal.modal('open');
  },

  'click .click_edit-plan-button'(event, template) {
    FlowRouter.go('admin.control.plan.edit', { id: FlowRouter.getParam("id"),
    planId: template.data.info._id});
  }
});


Template.plan_delete_confirm.onRendered(function() {
  deleteModal = this.$('.modal');
  deleteModal.modal();
});

Template.plan_delete_confirm.events({
  'click .click_delete-plan'(event, template) {
    deleteModal.modal('close');
    var planId = deleteId.get();
    deletePlan.call(planId, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("Plan deleted");
      }
    });
  }
});
