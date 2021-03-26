import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { Orders } from '../../../../api/orders/orders.js';

import './order_detail.html';
import './order_detail.scss';

let order = new ReactiveVar();
let GSTString = new ReactiveVar();
let moduleGST = new ReactiveVar();
let moduleGSTString = new ReactiveVar();
let planGST = new ReactiveVar();

Template.order_detail_page.onRendered(function() {
     this.autorun(() => {
     Meteor.setTimeout(() => {
      var orderId = FlowRouter.getParam("orderId");
     var agencies = Roles.getScopesForUser(Meteor.userId());
     console.log('agencies',agencies[0]);
     var sub = this.subscribe('orders.agency',agencies[0],orderId);
      this.autorun(() => {
      if(sub.ready()) {
     order=Orders.find().fetch()[0];
     console.log('sdadasdas order', order);
   }
 });
    }, 100);
   });
  GSTString='';
  moduleGSTString='';
  moduleGST=0;
  planGST=0;
  order='';


});

Template.order_detail_page.events({
'click #download_invoice'(event, template) {
		 console.log('in download invoice'); 
	 	 html2canvas(document.querySelector("#invoice_details"), {width: 750, height: 1050 }).then(canvas => {
		 var imgData = canvas.toDataURL('image/png');  
		 var doc = new jsPDF('p', 'mm'); 
		 console.log('doc',doc);
		 console.log('canvas',canvas);
		 doc.addImage(imgData, 'PNG', 10, 10);
		 doc.save('sample-file.pdf');
		});
   },
})

Template.order_detail_page.helpers( {
paymentCompleteDetail(){
  let order = Orders.findOne();
    return order ? order : 0;
	// order = Orders.find({$and: [{_id:orderId},{'agencyId':agencies[0]}]}).fetch()[0];
},
showDowloadInvoice(status){
if(status=="Credit"){
  return true;
}
return false;
},
totalPlanCostDetail(){
 return "<b>Total Apps Cost : </b>"+Number(order.agencyPlanNumOfAppsPurchased)+'X ₹'+Number(order.agencyPlanCostPerApp)+'= ₹'+(order.agencyPlanNumOfAppsPurchased*order.agencyPlanCostPerApp);
},

totalModuleCostDetail(){
	if(order.agencyModule){
	    if(order.agencyModule.length>0){
    var agencyModuleAmountString='<b>Total Module Cost : </b>';
    var agencyModuleAmount = 0;
    GSTString='';
    for(i=0; i< order.agencyModule.length; i++){
         agencyModuleAmountString=agencyModuleAmountString+ "<br/> Module Cost"+(i+1)+":"+Number(order.agencyModule[i].agencyModuleNumOfModulesPurchased)+' X ₹ '+order.agencyModule[i].moduleCostPerModule+'= ₹'+Number(order.agencyModule[i].agencyModuleNumOfModulesPurchased*order.agencyModule[i].moduleCostPerModule)
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
}
},
TotalGSTDetail(){
  if(order._id){
        planGST=((order.agencyPlanGstRate*order.agencyPlanNumOfAppsPurchased*order.agencyPlanCostPerApp)/100);
       moduleGSTString=moduleGSTString+ '= ₹'+(planGST+moduleGST).toFixed(2) ;
      return '<b>Total GST : </b>₹ '+planGST+moduleGSTString
  }else{
    return '';
  }

},
TotalCostDetail(){
  console.log('dssd',order)
  if(order._id){
      let totalAmount=parseFloat(Math.round( (Number(order.agencyPlanAmount)+Number(order.agencyModuleAmount)+Number(moduleGST)+Number(planGST)) * 100) / 100).toFixed(2);
  if(order.agencyModuleAmount>0){
     TotalCost = "₹"+ order.agencyPlanAmount+"+ ₹"+order.agencyModuleAmount+"+ ₹"+ parseFloat(Math.round( (planGST+moduleGST) * 100) / 100).toFixed(2)  +"= ₹"+totalAmount;
  } else{
     TotalCost = "₹"+ order.agencyPlanAmount+"+ ₹"+ parseFloat(Math.round( (planGST+moduleGST) * 100) / 100).toFixed(2)  +"= ₹"+totalAmount;
   }
    return TotalCost;
  }

  },
    TodayDateOrder(date){
      if(date){
           console.log('date',date); 
           return (date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear());
      }
      else{
        return '';
      }
     
  },

});


Template.invoice_detail.helpers( {
  IsOrderDetail() {
  		var orderId = FlowRouter.getParam("orderId");
  		console.log('orderId',orderId)
  		order = Orders.find(orderId).fetch()[0];

	if(order){
		if(order.agencyOrderStatus=='Credit')
			return order;
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
  InvoiceTotalOrder(amount, qty, gst){ 
    return (((amount*qty)+(gst*amount*qty)/100).toFixed(2));
  },
  DownloadPDFOrder(){

},
  TodayDateOrderInvoice(date){
    if(date){
      console.log('date',date); 
      return (date.getDate()+'/'+(date.getMonth()+1)+'/'+date.getFullYear());
    }else{
      return '';
    }
    
  },
	});