import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Packages } from '../../../../api/packages/packages.js';
import { insertPackage,deletePackage, updatePackage} from '../../../../api/packages/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';

import './packages_page.html';
import './packages.scss';

var deleteModal = null;
var deleteId = new ReactiveVar();
var editModal = null;
var editId = new ReactiveVar();


Template.packages_page.onRendered(function(){
  this.subscribe('packages.all');
});

Template.packages_page.helpers({
  hasPackages() {
    return Packages.find().count() > 0;
  },
  packageList() {
    return Packages.find();
  }
});


Template.add_package_button.onRendered(function() {
  this.$('.modal').modal();
});

Template.package_add.events({
  'submit #add-new-package'(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    template.$(event.target)[0].reset();
    console.log(data);
    insertPackage.call(data, (err, res) => {
      if(err) {
	      showError(err);
      }
      else {
	      showSuccess("Added package");
      }
    });
  }
});

Template.package_details_item.events({
  'click .click_delete-package-button'(event, template) {
    deleteId.set(template.data.info._id);
    deleteModal.modal('open');
  },

  'click .click_edit-package-button'(event, template) {
    editId.set(template.data.info._id);
    console.log(editId.curValue);
    FlowRouter.go('admin.control.packages.new', { editId });
    // console.log('clicked');
  }
});


Template.package_delete_confirm.onRendered(function() {
  deleteModal = this.$('.modal');
  deleteModal.modal();
});

Template.package_delete_confirm.events({
  'click .click_delete-package'(event, template) {
    deleteModal.modal('close');
    var packageId = deleteId.get();
    deletePackage.call(packageId, (err, res) => {
      if(err) {
	      showError(err);
      }
      else {
	      showSuccess("Package deleted");
      }
    });
  }
});


Template.package_edit_modal.onRendered(function() {
  editModal = this.$('.modal');
  editModal.modal();
});

Template.package_edit_modal.helpers({
  packageDetails() {
    if(editId.get()) {
      return Packages.findOne(editId.get());
    }
    else {
      return false;
    }
  }
});

Template.package_edit_modal.events({
  'submit #edit-package'(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    data.packageId = editId.get();
    updatePackage.call(data, (err, res) => {
      if(err) {
	      showError(err);
      }
      else {
        showSuccess("Package details sucessfully updated.");
        editModal.modal('close');
      }
    });
  }
});

// Edit Package New

Template.package_edit.helpers({
  packageDetails() {
    if(editId.get()) {
      return Packages.findOne(editId.get());
    }
    else {
      return false;
    }
  }
});

Template.package_edit.events({
  'submit #package-edit'(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    data.packageId = editId.get();
    updatePackage.call(data, (err, res) => {
      if(err) {
	      showError(err);
      }
      else {
        showSuccess("Package details sucessfully updated.");
        editModal.modal('close');
      }
    });
  }
});