import './events_guest_profile_insurance.html';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Guests } from '../../../../api/guests/guests.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { ReactiveVar } from 'meteor/reactive-var';
import { updateGuestInsurance } from '../../../../api/guests/methods.js';

Template.agency_insurance_add.onCreated(function() {
  this.validVisa = new ReactiveVar(false);
});

Template.agency_insurance_add.onRendered(function() {
  this.$('select').material_select();
  this.validVisa.set(false);
  this.autorun(() => {
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    if(guest && guest.insuranceInfo) {

      this.$('#validInsurance').prop('checked', guest.insuranceInfo.validInsurance);
      Meteor.setTimeout(() => {
        this.$('#guestTitle').val(guest.insuranceInfo.insuranceTitle);
        this.$('#guestTitle2').val(guest.insuranceInfo.insuranceRelation);
        this.$('select').material_select();
      }, 500);
      this.validVisa.set(guest.insuranceInfo.validInsurance);
    }
    else {
      this.validVisa.set(false);
    }
  });

  this.autorun(() => {
    let valid = this.validVisa.get();
    Meteor.setTimeout(() => {
      this.$('select').material_select();
      this.$('.datepicker').pickadate({ selectYears: true });
    }, 100);
  });
});

Template.agency_insurance_add.helpers({
  validvisa() {
    return Template.instance().validVisa.get();
  },

  insuranceInformation() {
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    if(guest && guest.insuranceInfo) {
      return guest.insuranceInfo;
    }
    return {};
  },

  insuranceImages() {
    let guest = Guests.findOne(FlowRouter.getParam("guestId"));
    if(guest && guest.guestInsuranceImages && guest.guestInsuranceImages.length > 0) {
      return guest.guestInsuranceImages;
    }
    return false;
  }
});

Template.agency_insurance_add.events({
  'submit #add-insurance-form'(event, template) {
    event.preventDefault();
    var jq = template.$(event.target);
    var data = jq.serializeObject();
    data.guestId = FlowRouter.getParam("guestId");
    updateGuestInsurance.call(data, (err, res) => {
      if(err) showError(err);
      else showSuccess("Updated guest insurance details");
    });
  },

  'change #validInsurance'(event, template) {
    template.validVisa.set(event.target.checked);
  }
});
