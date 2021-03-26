import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Modules } from '../../../../api/modules/modules.js';
import { deleteModule} from '../../../../api/modules/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';

import './module_list.scss';
import './module_list.html';

var deleteModal = null;
var deleteId = new ReactiveVar();
Template.module_list_page.onRendered(function(){
  this.subscribe('modules.sort');
});

Template.module_list_page.helpers({
  hasModules() {
    return Modules.find().count() > 0;
  },
  moduleList() {

    return Modules.find();
  },
  addModuleRoute() {
     return FlowRouter.path('admin.control.module.add');
  }, 

});

Template.add_module_button.helpers({
  addModuleRoute() {
     return FlowRouter.path('admin.control.module.add');
  }, 
});

Template.module_details_item.events({
  'click .click_delete-module-button'(event, template) {
    deleteId.set(template.data.info._id);
    deleteModal.modal('open');
  },

  'click .click_edit-module-button'(event, template) {
    FlowRouter.go('admin.control.module.edit', { id: FlowRouter.getParam("id"),
    moduleId: template.data.info._id});
  }
});


Template.module_delete_confirm.onRendered(function() {
  deleteModal = this.$('.modal');
  deleteModal.modal();
});

Template.module_delete_confirm.events({
  'click .click_delete-module'(event, template) {
    deleteModal.modal('close');
    var moduleId = deleteId.get();
    deleteModule.call(moduleId, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("Module deleted");
      }
    });
  }
});
