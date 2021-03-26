import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
// import { Rooms } from '../../../../api/roompreference/rooms.js';
import { insertRoom ,updateRoom} from '../../../../api/roompreference/methods.js';

import './events_rooms.html';

let deleteId = new ReactiveVar();
let editModal = null;
let editId = new ReactiveVar();
let deleteModal = null;
Template.events_rooms.onRendered(function() {
  this.subscribe('rooms.event', FlowRouter.getParam("id"));
  Meteor.setTimeout(()=>{
    Materialize.updateTextFields();
  }, 100);
});
Template.events_rooms_add.onRendered(function() {
  this.subscribe('rooms.event', FlowRouter.getParam("id"));
});

Template.events_rooms.helpers({
  // hasfoods() {
  //   console.log(Rooms.find().fetch());
  //   return rooms.find().count() > 0;
  // },

  // foodList() {
  //   var detaill = Rooms.findOne({eventId : FlowRouter.getParam("id")});
  //   console.log(detaill);
  //   return Rooms.findOne({eventId : FlowRouter.getParam("id")});
  // }
});

Template.events_rooms_add.events({
  'submit #add-room'(event, template) {
    event.preventDefault();
    
    var target = template.$(event.target);
    var data = target.serializeObject();
    data.eventId = FlowRouter.getParam('id');
    console.log(data);
    template.$(event.target)[0].reset();
    insertRoom.call(data, (err, res) => {
      if(err) {
  showError(err);
      }
      else {
  showSuccess("room Added");
      }
    });
  }
});

Template.events_rooms.events({
  'submit #edit-room'(event, template) {
    event.preventDefault();
    console.log(FlowRouter.getParam('id'));
    var target = template.$(event.target);
    var data = target.serializeObject();
    data.eventId = FlowRouter.getParam('id');
    console.log(data);
    template.$(event.target)[0].reset();
    updateRoom.call(data, (err, res) => {
      if(err) {
	showError(err);
      }
      else {
	showSuccess("EDITED room DETAILS");
      }
    });
  }
});
