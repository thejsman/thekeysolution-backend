import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Features } from '../../../../api/features/features.js';
import { insertFeature, deleteFeature, updateFeature } from '../../../../api/features/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';

import './feature_bank_page.scss';
import './feature_bank_page.html';

var deleteModal = null;
var deleteId = new ReactiveVar();
var editModal = null;
var editId = new ReactiveVar();
Template.feature_bank_page.onRendered(function(){
  this.subscribe('features.all');
});

Template.feature_bank_page.helpers({
  hasFeatures() {
    return Features.find().count() > 0;
  },
  featureList() {
    return Features.find();
  }
});



Template.add_feature_description.events({
  'submit #add-feature'(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    template.$(event.target)[0].reset();
    insertFeature.call(data, (err, res) => {
      if(err) {
  showError(err);
      }
      else {
  showSuccess("Added feature");
      }
    });
  }
});

Template.feature_details_item.events({
  'click .click_delete-feature-button'(event, template) {
    deleteId.set(template.data.info._id);
    deleteModal.modal('open');
  },

  'click .click_edit-feature-button'(event, template) {
    editId.set(template.data.info._id);
    editModal.modal('open');
  }
});

Template.feature_edit_modal.onRendered(function() {
  editModal = this.$('.modal');
  editModal.modal();
  this.autorun(() => {
    let edId = editId.get();
    console.log(edId);
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
    }, 100);
  });
});

Template.feature_edit_modal.helpers({
  featureDetails() {
    if(editId.get()) {
      return Features.findOne(editId.get());
    }
    else {
      return false;
    }
  }
});

Template.feature_edit_modal.events({
  'submit #edit-feature'(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    data._id = editId.get();
    updateFeature.call(data, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("EDITED FEATURE DESCRIPTION");
	editModal.modal('close');
      }
    });
  }
});


Template.feature_delete_confirm.onRendered(function() {
  deleteModal = this.$('.modal');
  deleteModal.modal();
});

Template.feature_delete_confirm.events({
  'click .click_delete-feature'(event, template) {
    deleteModal.modal('close');
    var featureId = deleteId.get();
    deleteFeature.call(featureId, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("Feature deleted");
      }
    });
  }
});
