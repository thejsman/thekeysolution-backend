import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Random } from 'meteor/random';
import { FlowRouter } from 'meteor/kadira:flow-router';
import _ from 'lodash';
import moment from 'moment';

import { ServiceProviderSchema } from '../../../../api/services/schema.js';
import { insertService, updateService, addProviders } from '../../../../api/services/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import "./events_services_add.html";
import { Events } from '../../../../api/events/events.js';
import { Services } from '../../../../api/services/services.js';

Template.events_services_add_form.onRendered(function() {
  this.$('.tooltipped').tooltip({delay: 50});
  this.$(".modal").modal();
  Materialize.updateTextFields();
});

Template.events_services_add_form.helpers({
  title() {
    let editing = !!this.service;
    return editing ? "Edit Service Details" : "Add Service";
  },

  serviceDetails() {
    return this.service ? this.service : {};
  }
});

Template.events_services_add_form.events({
  'submit #add-service-form'(event, template) {
    event.preventDefault();
    let data = template.$(event.target).serializeObject();
    data.eventId = FlowRouter.getParam("id");
    let editing = !!template.data.service;
    let cbText = editing ? "Edited service data" : "Added service";
    let cb = (err, res) => {
      if(err) showError(err);
      else  showSuccess(cbText);
      template.$('.modal').modal('close');
      if(!editing) template.$(event.target)[0].reset();
    };
    if(editing) {
      data.serviceId = template.data.service._id;
      updateService.call(data, cb);
    }
    else {
      insertService.call(data, cb);
    }
  }
});
