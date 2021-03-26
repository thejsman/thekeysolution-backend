import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { Orders } from '../../../../api/orders/orders.js';

import './order_list.html';

Template.order_list_page.onRendered(function() {
  this.subscribe('orders.all');
});


Template.order_list_page.helpers({
	hasOrder(){
		var agencies = Roles.getScopesForUser(Meteor.userId());
		return Orders.find({agencyId:agencies[0]}).count() > 0;
	},
	OrderList(){
		var agencies = Roles.getScopesForUser(Meteor.userId());
		return Orders.find({agencyId:agencies[0]});
	},
	
});

Template.order_list.helpers({
	CorrectDate(date){
     return date.getDate()+'-'+(date.getMonth()+1)+'-'+date.getFullYear(); 
	},
});

Template.order_list.events({
 'click .view_Details'(event, template) {
 	 FlowRouter.go('admin.control.order.detail', { orderId: FlowRouter.getParam("orderId"),
    orderId: template.data.info._id});
 }
});