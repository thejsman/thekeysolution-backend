import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { Modules } from '../../../../api/modules/modules.js';
import { Agencies } from '../../../../api/agencies/agencies.js';
import { insertModule } from '../../../../api/modules/methods.js';

import './modules_page.scss';
import './modules_page.html';


Template.modules_page.onRendered(function() {
  this.subscribe('admin.agency.list');  
    this.autorun(() => {
    Meteor.setTimeout(() => {
      this.$('select').material_select();
    }, 100);
  });
});

Template.modules_page.helpers({
   moduleAgencyList() {
    if(Agencies.find().count() > 0) {
      console.log('data of agency',Agencies.find().count());
      return Agencies.find();
    }
    else {
      return false;
    }
  },  
});


Template.modules_page.events({
  'submit #modules-page'(event, template) {
    event.preventDefault();
    var target = template.$(event.target);
    var data = target.serializeObject();
  //  template.$(event.target)[0].reset();
    template.$('.modal').modal('close');
    console.log('data to be inserted ', data);
    insertModule.call(data, (err, res) => { 
      if(err) {
	showError(err);
      }
      else {
	showSuccess("Module Added");
   template.$(event.target)[0].reset(); 
   FlowRouter.go('admin.control.module');
      }
    });
  },

   'click #module_available_for'(event, template) { 
   console.log('event')

 if($('#module_available_for').prop('checked')){
      $('#module_agency_list_div').removeClass('hide'); 
   }else{
      $('#module_agency_list_div').addClass('hide'); 
   }
   }

});

