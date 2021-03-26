import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { Orders } from '../../../../api/orders/orders.js';
import { sendInvoice, paymentSuccessDetails } from '../../../../api/orders/methods.js';
import { updateAgency } from '../../../../api/updated_agency/methods.js';
import { updateOrder } from '../../../../api/orders/methods.js';

 
import './payment_success.html';


let order = new ReactiveVar();
let GSTString = new ReactiveVar();
let moduleGST = new ReactiveVar();
let moduleGSTString = new ReactiveVar();
let planGST = new ReactiveVar();
let paymentDetails = new ReactiveVar();

Template.invoice_success.onRendered(function() {
  this.subscribe('orders.all');
});

Template.payment_success.onRendered(function() {
  this.subscribe('orders.all');
  GSTString='';
  moduleGSTString='';
  moduleGST=0;
  planGST=0;
var imgData = '';

var payment = {
  payment_id : FlowRouter.getQueryParam('payment_id'),
  payment_request_id : FlowRouter.getQueryParam('payment_request_id')
}


  paymentSuccessDetails.call(payment, (err, res) => {
            if(err) {
        showError(err);
            }
            else {
        console.log("data from insta mojo ",res);
        paymentDetails = res;

        if(paymentDetails.payment_request.payment.status == "Credit" ){

    var submitdata={
      agencyOrderStatus: 'Credit',
      agencyPaymentId: paymentDetails.payment_request.payment.payment_id,
      agencyPaymentRequestId: paymentDetails.payment_request.id,
    }
     updateOrder.call(submitdata, (err, res) => { 
      if(err) {
       showError(err);  
       console.log('Payment error')
      }  
      else {
         console.log("Payment Success",res);  
      }   
    });   

   var updated_order = Orders.find({agencyPaymentRequestId:submitdata.agencyPaymentRequestId}).fetch();
   console.log('updated_order',updated_order);

   var orderdata = {
      agencyPlanNumOfAppsPurchased: updated_order[0].agencyPlanNumOfAppsPurchased,
      agencyPlanId: updated_order[0].agencyPlanId,
      agencyPlanName: updated_order[0].agencyPlanName,
      agencyId: updated_order[0].agencyId,
      agencyPlanDescription: updated_order[0].agencyPlanDescription,
      agencyPlanFeatureList: updated_order[0].agencyPlanFeatureList,
      agencyPlanAppsGenerated: 0,
      agencyPlanFeatureName: updated_order[0].agencyPlanFeatureName,
      agencyModule: updated_order[0].agencyModule,
      planPurchaseDateTime:update_order[0].lastUpdatedAt, 
    }

    console.log('orderdata',orderdata)
 
        updateAgency.call(orderdata, (err, res) => { 
          if(err) {
          showError(err);  
          }  
          else {
            showSuccess("Agency Updated");
          }   
        });    
 
 
      this.autorun(() => {
    Meteor.setTimeout(() => {
     html2canvas(document.querySelector("#invoice"), {width: 750, height: 1050 }).then(canvas => {
     imgData = canvas.toDataURL('image/png');  
     var doc = new jsPDF('p', 'mm'); 
     var width = doc.internal.pageSize.width;    
     var height = doc.internal.pageSize.height;
     doc.fillStyle = '#fff';
     doc.addImage(imgData, 'PNG', 10, 10,width,height);

      doc.save('sample-file.pdf');
    var file2 =  doc.output('datauristring');               //doc.output('datauristring');

        sendInvoice.call(file2, (err, res) => {
            if(err) {
        showError(err);
            }
            else {
        showSuccess("Invoice Mailed");
            }
          });  
     });
    
      }, 1000);
   }); 
}

            }
          });





});

Template.payment_success.events({
})

Template.payment_success.helpers( {
 appsRemaining(purchased, generated){
  return (purchased-generated);
 },
paymentComplete(){
	var agencies = Roles.getScopesForUser(Meteor.userId());
	order = Orders.findOne({agencyId:agencies[0]},{skip:0,limit:1,sort:{agencyPurchaseDateTime:-1}});
	if(order){
		if(order.agencyOrderStatus=='Credit'){
      $('#failPayment').hide();
      $('#pendingPayment').hide();
			return order}
		else{
      $('#failPayment').removeClass('hide');
      $('#pendingPayment').hide();
       Meteor.setTimeout(() => {
      FlowRouter.go('admin.control.order');
    },5000);
			return false;}
	}
	else{
    $('#failPayment').removeClass('hide');
    $('#pendingPayment').hide();
      Meteor.setTimeout(() => {
      FlowRouter.go('admin.control.order');
    },5000);
		return false
	}
},
totalPlanCost(){
 return "Total Apps Cost :"+Number(order.agencyPlanNumOfAppsPurchased)+'X ₹'+Number(order.agencyPlanCostPerApp)+'= ₹'+(order.agencyPlanNumOfAppsPurchased*order.agencyPlanCostPerApp);
},

totalModuleCost(){
	    if(order.agencyModule.length>0){
    var agencyModuleAmountString='Total Module Cost :';
    var agencyModuleAmount = 0;
    GSTString='';
    for(i=0; i< order.agencyModule.length; i++){
         agencyModuleAmountString=agencyModuleAmountString+ "<br/>" + (data.agencyModule[i].agencyModuleName) + ":"+Number(order.agencyModule[i].agencyModuleNumOfModulesPurchased)+' X ₹ '+order.agencyModule[i].moduleCostPerModule+'= ₹'+Number(order.agencyModule[i].agencyModuleNumOfModulesPurchased*order.agencyModule[i].moduleCostPerModule)
         agencyModuleAmount=agencyModuleAmount+Number(order.agencyModule[i].agencyModuleNumOfModulesPurchased)*order.agencyModule[i].moduleCostPerModule
         moduleGSTString=moduleGSTString+'+ ₹'+((order.agencyModule[i].moduleGstRate*order.agencyModule[i].agencyModuleNumOfModulesPurchased*order.agencyModule[i].moduleCostPerModule)/100);
         moduleGST=moduleGST+((order.agencyModule[i].moduleGstRate*order.agencyModule[i].agencyModuleNumOfModulesPurchased*order.agencyModule[i].moduleCostPerModule)/100);
         GSTString=GSTString+''+moduleGST
    }
    agencyModuleAmountString=agencyModuleAmountString+'<br/>';
    return agencyModuleAmountString;
  }else{
  	return '';
  }
},
TotalGST(){
  planGST=((order.agencyPlanGstRate*order.agencyPlanNumOfAppsPurchased*order.agencyPlanCostPerApp)/100);
   moduleGSTString=moduleGSTString+ '= ₹'+(planGST+moduleGST).toFixed(2) ;
  return 'Total GST : ₹ '+planGST+moduleGSTString
},
TotalCost(){
  let totalAmount=parseFloat(Math.round( (Number(order.agencyPlanAmount)+Number(order.agencyModuleAmount)+Number(moduleGST)+Number(planGST)) * 100) / 100).toFixed(2);
  if(order.agencyModuleAmount>0){
     TotalCost = "₹"+ order.agencyPlanAmount+"+ ₹"+order.agencyModuleAmount+"+ ₹"+ parseFloat(Math.round( (planGST+moduleGST) * 100) / 100).toFixed(2)  +"= ₹"+totalAmount;
  } else{
     TotalCost = "₹"+ order.agencyPlanAmount+"+ ₹"+ parseFloat(Math.round( (planGST+moduleGST) * 100) / 100).toFixed(2)  +"= ₹"+totalAmount;
   }
    return TotalCost;
  },

});


Template.invoice_success.helpers( {
  IsOrder() {
  	var agencies = Roles.getScopesForUser(Meteor.userId());
	order = Orders.findOne({agencyId:agencies[0]},{skip:0,limit:1,sort:{agencyPurchaseDateTime:-1}});
  console.log('order',order)
	if(order){
		if(order.agencyOrderStatus=='Credit')
			return order
		else
			return false;
	}
	else{
		return false
	}
},
  indexPlusTwo(index){
    return (index+2);
  },
  InvoiceTotal(amount, qty, gst){ 
    return (((amount*qty)+(gst*amount*qty)/100).toFixed(2));
  },
  TodayDate(){
    var date=new Date();
    return (date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear());
  },
  DownloadPDF(){

},
	});