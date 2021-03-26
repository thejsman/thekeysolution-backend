
import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Orders } from './orders.js';
import { OrdersSchema } from './schema.js';
import { IncrementOrderCount } from './ordersUtils.js';
import { Roles } from 'meteor/meteor-roles';
import { Agencies } from '../agencies/agencies.js';
import { HasRole } from '../../extras/hasRole.js';
import { Email } from 'meteor/email';

export const insertOrder = new ValidatedMethod({
  name: "Orders.methods.insert",
  validate: null,
  run(orderNew) {
    let payload=orderNew.payload;
    let orderId='';
    delete orderNew.payload;
    console.log('daata',payload,orderNew)
    if(HasRole(this.userId, 'add-orders')) { 

    var count = IncrementOrderCount(orderNew.agencyId);
    var agency = Agencies.find(orderNew.agencyId).fetch();
    var date = new Date();
    orderNew.orderId = agency[0].name.replace(/\s/g,'').substring(0, 3) + (date.getFullYear().toString().substr(-2)) + (("0" + (date.getMonth() + 1)).slice(-2)) + (("0" + date.getDate()).slice(-2)) + count ;
    console.log(' orderNew.orderId', orderNew.orderId);

      Orders.insert(orderNew,function(error, doc){
        if(error){

        }else{
          orderId=doc;
        }
      });
    } 
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }

    if(Meteor.isServer) {
      let wb = require('./server/payment.js').onlinePayment(payload);
       Orders.update(orderId, {
         $set: { "agencyPaymentRequestId": wb.payment_request.id }
      });
      return wb;
    }
  }
});


export const updateOrder = new ValidatedMethod({
  name: "Orders.methods.update",
  validate: null,
  run(orderUpdate) {
    if(HasRole(this.userId, 'edit-orders')) {
      orderUpdate.lastUpdatedAt=(new Date()).toISOString();
      Orders.update({agencyPaymentRequestId:orderUpdate.agencyPaymentRequestId}, {
      	$set: orderUpdate
      },function(err,res){
        if(err){
          throw new Meteor.Error("Not able to update Order");
        }
        else{
          return res;
        }
      });
    }
    else {
      throw new Meteor.Error("NO PERMISSIONS");
    }
  }
});

export const sendInvoice = new ValidatedMethod({
  name: "Invoice.Email",
  validate:null,
  run(imgData) {
    var role = Roles.getScopesForUser(Meteor.userId());
    var agency = Agencies.findOne(role[0]);
     if(Meteor.isServer) {
      require('./server/sendInvoice.js').SendInvoice(imgData,agency.email);
    }
  }
});



export const paymentSuccessDetails = new ValidatedMethod({
  name: "Payment.Details",
  validate:null,
  run(payment) {
     if(Meteor.isServer) {
      let wb = require('./server/payment.js').PaymentDetails(payment);
      return wb;
    }
  }
})


