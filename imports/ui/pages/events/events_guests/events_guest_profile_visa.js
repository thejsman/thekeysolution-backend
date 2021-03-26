import './events_guest_profile_visa.html';
import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import { Guests } from '../../../../api/guests/guests.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { updateGuestVisa } from '../../../../api/guests/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';

Template.agency_visa_add.onCreated(function() {
  this.validVisa = new ReactiveVar(false);
});

Template.agency_visa_add.onRendered(function() {
  this.$('select').material_select();
  this.validVisa.set(false);
  this.autorun(() => {
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    if(guest && guest.visaInformation) {
      this.$('#guestValidVisa').prop('checked', guest.visaInformation.guestValidVisa);
      this.validVisa.set(guest.visaInformation.guestValidVisa);

      Meteor.setTimeout(() => {
        this.$('#guestCountryIssue').val(guest.visaInformation.guestCountryIssue);
      });
    }
    else {
      this.validVisa.set(false);
    }
  });

  this.autorun(() => {
    let valid = this.validVisa.get();
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
      this.$('select').material_select();
      this.$('.datepicker').pickadate({ selectYears: true, selectMonths: true });
    }, 100);
  });
});

Template.agency_visa_add.helpers({
  validvisa() {
    return Template.instance().validVisa.get();
  },

  visaInformation() {
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    if(guest && guest.visaInformation) {
      console.log(guest.visaInformation);
      return guest.visaInformation;
    }
    return {};
  },

  visaImages() {
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    if(guest && guest.guestVisaImages && guest.guestVisaImages.length > 0) {
      return guest.guestVisaImages;
    }
    return false;
  }
});


Template.agency_visa_add.events({
  'submit #add-visa-form'(event, template) {
    event.preventDefault();
    var jq = template.$(event.target);
    var data = jq.serializeObject();
    data.guestId = FlowRouter.getParam("guestId");
    updateGuestVisa.call(data, (err, res) => {
      if(err) showError(err)
      else showSuccess("Updated guest visa details");
    });
  },

  'change #guestValidVisa'(event, template) {
    template.validVisa.set(event.target.checked);
  }

});
