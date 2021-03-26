import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { Modules } from '../../../../api/modules/modules.js';
import { Agencies } from '../../../../api/agencies/agencies.js';
import { updateModule } from '../../../../api/modules/methods.js';

import './modules_edit.scss';
import './modules_edit.html';

var moduleId = new ReactiveVar();

Template.modules_edit_page.onRendered(function() {
   var moduleId = FlowRouter.getParam("moduleId");
  var sub = this.subscribe('modules.one', moduleId);
    this.subscribe('admin.agency.list');

  this.autorun(() => {
        Meteor.setTimeout(() => {
      Materialize.updateTextFields();
       this.$('select').material_select();
      }, 100);
   }); 
   this.autorun(() => {
     Meteor.setTimeout(() => {
    var data=Modules.findOne(moduleId);
   if($('#edit_module_available_for').prop('checked')){
      $('#edit_module_agency_list_div').removeClass('hide'); 
   }else{
      $('#edit_module_agency_list_div').addClass('hide'); 
   }

    if(data && data.moduleAgencyList && data.moduleAgencyList.length > 0) {
       data.moduleAgencyList.forEach(f => {
         this.$('#editModuleAgencyList').val(data.moduleAgencyList);
         this.$('select').material_select();
      });
    }
    }, 100);
   });
}); 

Template.modules_edit_page.helpers({

  moduleDetails() {
  var moduleId = FlowRouter.getParam("moduleId");
    if(moduleId) {
      var data=Modules.findOne(moduleId);

      if(data && data.moduleIsStatusInactive ) {
       $('#edit_module_status').attr('checked',true);
     } 
     else{
       $('#edit_module_status').attr('checked',false);
     }  

      if(data && data.moduleIsAvailableForSpecificAgency ) {
       $('#edit_module_available_for').attr('checked',true);
     }   
     else{
      $('#edit_module_available_for').attr('checked',false);
     }



 return Modules.findOne(moduleId);
    }
    else {
      return false;
    }
  },
   moduleAgencyList() {
    if(Agencies.find().count() > 0) {
      return Agencies.find();
    }
    else {
      return false;
    }
  },  
});


Template.modules_edit_page.events({
  'submit #modules-edit-page'(event, template) {
    event.preventDefault();
    var target = template.$(event.target);
    var data = target.serializeObject();
   
     if($('#edit_module_available_for').prop('checked')==true){
       data.moduleIsAvailableForSpecificAgency = true;
     }
     else{
       data.moduleIsAvailableForSpecificAgency = false;
       data.moduleAgencyList=[];
     }
      if($('#edit_module_status').prop('checked')==true){
       data.moduleIsStatusInactive = true;
     }
     else{
       data.moduleIsStatusInactive = false;
     }
    data.moduleId=FlowRouter.getParam("moduleId");
    template.$('.modal').modal('close');
    updateModule.call(data, (err, res) => { 
      if(err) {
	      showError(err);
      }
      else {
      	showSuccess("Module Updated");
        template.$(event.target)[0].reset(); 
        FlowRouter.go('admin.control.module');
      }
    });
  },

   'click #edit_module_available_for'(event, template) { 
   if($('#edit_module_available_for').prop('checked')){
      $('#edit_module_agency_list_div').removeClass('hide'); 
   }else{
      $('#edit_module_agency_list_div').addClass('hide'); 
   }
   }

});

