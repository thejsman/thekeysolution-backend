import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { insertAirportManager } from '../../../../api/managers/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import './events_managers_add_airport.html';

Template.events_managers_add_airman.onRendered(function() {
  this.$('.tooltipped').tooltip({delay: 50});
  this.$('.modal').modal();
});

Template.events_managers_add_airman.events({
  'submit #add-new-airman' (event, template) {
    event.preventDefault();
    let form = template.$(event.target);
    let data = form.serializeObject();
    data.eventId = FlowRouter.getParam("id");
    insertAirportManager.call(data, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("Added Airport Manager");
	template.$('.modal').modal('close');
	form[0].reset();
      }
    });
   }
});
