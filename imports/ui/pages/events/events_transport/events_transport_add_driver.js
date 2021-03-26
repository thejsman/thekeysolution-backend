// Time-stamp: 2017-08-29 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_transport_add_driver.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { insertDriver } from '../../../../api/transport/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import './events_transport_add_driver.html';

Template.events_transport_add_driver.onRendered(function() {
  this.$('.modal').modal();
});

Template.events_transport_add_driver.events({
  'submit #add-new-driver' (event, template) {
    event.preventDefault();
    let form = template.$(event.target);
    let data = form.serializeObject();
    data.eventId = FlowRouter.getParam("id");
    insertDriver.call(data, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("Added Driver");
	template.$('.modal').modal('close');
	form[0].reset();
      }
    });
   }
});
