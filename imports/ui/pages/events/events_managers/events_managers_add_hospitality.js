// Time-stamp: 2017-08-29
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_managers_add_driver.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { insertHospitalityManager } from '../../../../api/managers/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import './events_managers_add_hospitality.html';

Template.events_managers_add_hosman.onRendered(function() {
  this.$('.tooltipped').tooltip({delay: 50});
  this.$('.modal').modal();
});

Template.events_managers_add_hosman.events({
  'submit #add-new-hosman' (event, template) {
    event.preventDefault();
    let form = template.$(event.target);
    let data = form.serializeObject();
    data.eventId = FlowRouter.getParam("id");
    insertHospitalityManager.call(data, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("Added Hospitality Manager");
	template.$('.modal').modal('close');
	form[0].reset();
      }
    });
   }
});
