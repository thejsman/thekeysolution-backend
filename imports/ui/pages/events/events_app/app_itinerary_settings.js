import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Events } from '../../../../api/events/events.js';
import { SubEvents } from '../../../../api/subevents/subevents.js';
import { ReactiveVar } from 'meteor/reactive-var';
import { AppItineraryItemSchema } from '../../../../api/app_general/schema.js';
import { showError } from '../../../components/notifs/notifications.js';
import { App_General } from '../../../../api/app_general/app_general.js';

import './app_itinerary_settings.html';
import _ from 'lodash';
import moment from 'moment';

let subdate = new ReactiveVar(null);
Template.app_itinerary_setting_add.onRendered(function() {
  subdate.set(null);
  this.subscribe('subevents.event', FlowRouter.getParam("id"));
  this.$('.datepicker').pickadate({
    selectMonths: true,
    selectYears: 15,
    onSet(ctx) {
      let d = moment(ctx.select).format('DD MMMM, YYYY');
      subdate.set(d);
    }
  });
  this.$('.timepicker').pickatime();
  this.$('.tooltip-icon').tooltip({delay: 50});
  this.$('.tooltipped').tooltip({delay: 50});
  
  // Chrome date & time flicker issue
  this.$('.timepicker').on('mousedown', (event) => event.preventDefault())
  

  this.autorun(() =>{
    var event = Events.find().count();
    let edit = this.data.editId.get();

    if(event > 0 && !edit){
      var thisEvent = Events.findOne();
      var eventStartDate = thisEvent.basicDetails.eventStart;
      Meteor.setTimeout(() => {
        let d = Date.parse(eventStartDate);
        let o = this.$('.datepicker').pickadate('picker');
        if(o) {
          o.set('select', d);
        }
      }, 1000);
    }
  });

  this.autorun(() => {
    let d = subdate.get();
    let e = SubEvents.find().count();
    //console.log("Date is -",d);
    if(e > 0) {
      Meteor.setTimeout(() => {
        this.$('select').material_select();
      },1000);
    }
  });

  this.autorun(() => {
    let edId = this.data.editId.get();
    if(edId) {
      let list = this.data.itineraryVar.get();
      let it = _.find(list, l => {
        return l._id === edId;
      });
      if(it) {
        subdate.set(it.date);
        let ev = SubEvents.findOne(it.subEventId);
        if(ev) {
          Meteor.setTimeout(() => {
            this.$('select').val(ev._id);
            this.$('select').material_select();
          }, 500);
        }
        else {
          Meteor.setTimeout(() => {
            this.$('select').val(null);
            this.$('select').material_select();
          }, 200);
        }
      }
    }
  });
});

Template.app_itinerary_setting_add.helpers({

  itineraryInfo() {
    let edId = this.editId.get();
    if(edId) {
      let list = this.itineraryVar.get();
      let item = _.find(list, l => {
        return l._id === edId;
      });
      return item;
    }

    return {};
  },

  subevents() {
    let date = subdate.get();
    date = moment(date).format('D MMMM, YYYY');
    if(date) {
      return SubEvents.find({
        subEventDate: date
      });
    }

    return [];
  },

  itineraryTitle() {
    if(this.editId.get()) {
      return "Edit Itinerary";
    }
    return "Add itinerary";
  }
});

Template.app_itinerary_setting_add.events({
  'submit #add-new-itinerary'(event, template) {
    event.preventDefault();
    let form = template.$(event.target);
    let data = form.serializeObject();
    //console.log(data);
    var cleanedObj = AppItineraryItemSchema.clean(data);
    var validationContext = AppItineraryItemSchema.newContext();
    validationContext.validate(cleanedObj);
    if(validationContext.isValid()) {
      let it = template.data.itineraryVar.get();
      let edId = template.data.editId.get();

      if(edId) {
        cleanedObj._id = edId;
        var index = _.findIndex(it, {_id: edId});
        it.splice(index, 1, cleanedObj);
      }
      else {
        cleanedObj._id = Random.id();
        it.push(cleanedObj);
      }
      it = it.sort((a,b) => {
        let aTime = moment(a.date + ' ' + a.startTime, 'DD MMMM, YYYY HH:mm a');
        let bTime = moment(b.date + ' ' + b.startTime, 'DD MMMM, YYYY HH:mm a');

        return aTime.valueOf() - bTime.valueOf();
      });
      template.data.itineraryVar.set(it);
      template.$('.modal').modal('close');
      // console.log(cleanedObj);
    }
    else {
      //console.log(validationContext.validationErrors());

      showError(validationContext.validationErrors()[0].toString());
    }
  }
});

Template.app_itinerary_setting_list.helpers({
  getSubEvent(id) {
    let sub = SubEvents.findOne(id);

    return sub ? sub.subEventTitle : '';
  }
});

Template.app_itinerary_setting_list.events({
  'click .click_itinerary-edit-button'(event, template) {
    template.data.editId.set(event.target.id);
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
      $('#selectIcon').val($('#selectIcon').attr('value'));
      $('#selectIcon').material_select();
      var selected_value=$('div.ablIconSelect .select-wrapper input.select-dropdown').val();

      selected_value=selected_value.replace('<i class="icon-common-itinerary"></i>',' ');
      selected_value=selected_value.replace('<i class="icon-food-itineray-and-meal"></i>',' ');
      selected_value=selected_value.replace('<i class="icon-event-details"></i>',' ');
      selected_value=selected_value.replace('<i class="icon-travel-itinerary"></i>',' ');
      selected_value=selected_value.replace('<i class="icon-transport"></i>',' ');
      selected_value=selected_value.replace('<i class="icon-bed"></i>',' ');
      selected_value=selected_value.replace('<i class="icon-tour"></i>',' ');


      $('div.ablIconSelect .select-wrapper input.select-dropdown').val(selected_value);

    }, 800);
  },

  'click .click_itinerary-delete-button'(event, template) {
    let list = template.data.itineraryVar.get();
    _.remove(list, l => {
      return l._id === this._id;
    });
    template.data.itineraryVar.set(list);
  }
});
