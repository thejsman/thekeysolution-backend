import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { Agencies } from '../../../../api/agencies/agencies.js';
import { Plans } from '../../../../api/plans/plans.js';
import { Features } from '../../../../api/features/features.js';
import { Orders } from '../../../../api/orders/orders.js';
import { Modules } from '../../../../api/modules/modules.js';
import { Roles } from 'meteor/meteor-roles';
import { insertOrder } from '../../../../api/orders/methods.js';
import { updateAgency } from '../../../../api/updated_agency/methods.js';



import './subscription.scss';
import './subscription.html';

let agencyModule = [];
let selected_plan_id = new ReactiveVar();
let agencyPlanNumOfAppsPurchased = new ReactiveVar();
let agencyPlanId = new ReactiveVar();
let agencyPlanName = new ReactiveVar();
let agencyPlanCostPerApp = new ReactiveVar();
let agencyPlanDescription  = new ReactiveVar();
let agencyPlanFeatureList = [];
let agencyPlanFeatureName = '';
let orderdata = new ReactiveVar();
let submitdata = new ReactiveVar();
let agencyPlanAmount = new ReactiveVar();
let agencyBillingAmount = new ReactiveVar();
let agencyModuleAmount = new ReactiveVar();
let agencyPlanAmountString = new ReactiveVar();
let agencyModuleAmountString = new ReactiveVar();
let planGST = new ReactiveVar();
let moduleGSTString = new ReactiveVar();
let agencyBillingAmountString = new ReactiveVar();
let moduleGST = new ReactiveVar();
let totalAmount = new ReactiveVar();



function Reinitialaize(){ 
agencyModule = [];
selected_plan_id = '';
agencyPlanNumOfAppsPurchased = '';
agencyPlanId = '';
agencyPlanName = '';
agencyPlanDescription  = '';
agencyPlanFeatureList = [];
agencyPlanFeatureName = '';
orderdata = {};
submitdata = {};
agencyPlanAmount = '';
agencyBillingAmount = 0;
agencyModuleAmount = 0;
agencyPlanCostPerApp = 0;
agencyPlanAmountString = '';
agencyModuleAmountString = '';
agencyBillingAmountString='';
planGST='';
moduleGSTString='';
moduleGST=0;
totalAmount=0;
};

Template.agency_subscription.onRendered(function() {
  Reinitialaize();
  this.subscribe('agency.one');
  this.subscribe('features.all');
  this.subscribe('modules.all');
  this.subscribe('plans.all');
  agencyModuleAmount=0;
  moduleGSTString='';
  moduleGST=0;
  // TODO : @MB set value false
  Session.set('showModal', false);
  this.autorun(() => {
    Meteor.setTimeout(() => {
         $('.subscription_num_of_apps').material_select();
      }, 1000);
   }); 

});

Template.agency_subscription.helpers({
 IsAgency() {
    var agencies = Roles.getScopesForUser(Meteor.userId());
    return Agencies.findOne(agencies[0]);
  },
 hasPlan(){
   return Plans.find({$and:[{"planIsStatusInactive":false},{$or:[{"planIsAvailableForSpecificAgency":false},{"planAgencyList":{$in:Roles.getScopesForUser(Meteor.userId())}}]}]}).count() >0;
 },
 planList(){
  return Plans.find({$and:[{"planIsStatusInactive":false},{$or:[{"planIsAvailableForSpecificAgency":false},{"planAgencyList":{$in:Roles.getScopesForUser(Meteor.userId())}}]}]});
 },
 hasModule(){
  return Modules.find({$and:[{"moduleIsStatusInactive":false},{$or:[{"moduleIsAvailableForSpecificAgency":false},{"moduleAgencyList":{$in:Roles.getScopesForUser(Meteor.userId())}}]}]}).count() >0;
 },
 moduleList(){
  return Modules.find({$and:[{"moduleIsStatusInactive":false},{$or:[{"moduleIsAvailableForSpecificAgency":false},{"moduleAgencyList":{$in:Roles.getScopesForUser(Meteor.userId())}}]}]});
 },
 appsRemaining(purchased, generated){
  return (purchased-generated);
 },
 currentPlanFeatureList(id){
  var feature=Features.find({"_id":{ "$in": id }});
  return feature;
 },
});


Template.subscription_purchase_plan.helpers({
 hasFeature(){
  return Features.find().count() >0 
 },
 featureList(id){
  var data= Plans.findOne(id); 
  var feature=Features.find({"_id":{ "$in": data.planFeatures }});
  return feature;
 },
 NumberOfAppList(id){
      var data=Plans.findOne(id);
       if(data && data.planMinNumOfApp && data.planMaxNumOfApp) {
        var arrayOfNumberOfApps = [];
        for(var i=data.planMinNumOfApp; i<=data.planMaxNumOfApp; i++) {
           arrayOfNumberOfApps.push(i.toString());
        }
         return arrayOfNumberOfApps;
    }
  },

  });
Template.subscription_purchase_plan.events({
   'click .agency_purchase_plan_submit'(event, template) {
      var selected_plan_id=template.data.info._id;
      agencyPlanNumOfAppsPurchased = $( "#"+selected_plan_id+" .subscription_num_of_apps option:selected" ).val();
      agencyPlanId=template.data.info._id;
      agencyPlanName=template.data.info.planName;
      agencyPlanDescription=template.data.info.planDescription;
      agencyPlanFeatureList=template.data.info.planFeatures;
      agencyPlanGstRate=template.data.info.planGstRate;
      agencyPlanCostPerApp = template.data.info.planCostPerApp;
      agencyPlanAmount = template.data.info.planCostPerApp*Number(agencyPlanNumOfAppsPurchased);
      agencyPlanAmountString = ""+Number(agencyPlanNumOfAppsPurchased)+'X ₹'+template.data.info.planCostPerApp+'= ₹'+agencyPlanAmount;
      planGST=((template.data.info.planGstRate*agencyPlanAmount)/100);
      var feature=Features.find({"_id":{ "$in": template.data.info.planFeatures }}).fetch();
      var featurelist=''
      for(i=0; i<feature.length;i++){
        featurelist =featurelist + feature[i].featureDescription+', ';
      }
      agencyPlanFeatureName=featurelist.slice(0, -2);
      $( ".agency_purchase_plan_submit " ).text('select');
      $(".single-plan").removeClass('teal');
      $("#"+selected_plan_id).addClass('teal');
      $( "#"+selected_plan_id+" .agency_purchase_plan_submit " ).html('<i class="fa fa-check" aria-hidden="true"></i>'+' Selected');
   },  
});

Template.subscription_module_template.events({
   'click .agency_purchase_module_submit'(event, template) {
      var noOfModules= $( "#"+template.data.info._id+" > div >  .subscription_num_of_modules " ).val();
      var flag=0;
     if(agencyModule.length>0){  
      for(i=0;i<agencyModule.length;i++){
        if(agencyModule[i].agencyModuleId == template.data.info._id && (noOfModules == agencyModule[i].agencyModuleNumOfModulesPurchased || noOfModules=='' || noOfModules== null )){
             agencyModule.splice(i,1);
             flag=1;
             $("#"+template.data.info._id+".single-module").removeClass('teal');
             $( "#"+template.data.info._id+" .subscription_num_of_modules " ).val('');
             $( "#"+template.data.info._id+" .agency_purchase_module_submit " ).text('Select');
        }
        else if(agencyModule[i].agencyModuleId == template.data.info._id && noOfModules != agencyModule[i].agencyModuleNumOfModulesPurchased){
             flag=1;
              agencyModule[i].agencyModuleNumOfModulesPurchased=noOfModules;
              $("#"+template.data.info._id+".single-module").addClass('teal');
              $( "#"+template.data.info._id+" .agency_purchase_module_submit " ).html('<i class="fa fa-check" aria-hidden="true"></i>'+' Selected');
        }
      }
    }  
    if(flag==0){
        if(noOfModules==null || noOfModules=='' || noOfModules== undefined){
          $( "#"+template.data.info._id+" .agency_purchase_module_submit " ).text('Select');
           showError('Number of Modules cant be null');
        }
        else{
                var presently_selected_module={
                agencyModuleId:template.data.info._id,
                agencyModuleName:template.data.info.moduleName,
                agencyModuleNumOfModulesPurchased:noOfModules,
                agencyModuleDescription:template.data.info.moduleDescription,
                moduleCostPerModule:template.data.info.moduleCostPerModule,
                moduleGstRate: template.data.info.moduleGstRate,
              }
              agencyModule.push(presently_selected_module);
              $("#"+template.data.info._id+".single-module").addClass('teal');
              $( "#"+template.data.info._id+" .agency_purchase_module_submit " ).html('<i class="fa fa-check" aria-hidden="true"></i>'+' Selected');

              
        }
    }  
   },  
});



Template.agency_subscription.events({
   'submit #agency-order'(event, template) {
    event.preventDefault();
    var target = template.$(event.target);
    var data = target.serializeObject();
    agencyModuleAmountString='';
    moduleGSTString='';
    GSTString='';
    var agencyUserInfo={
                id:Meteor.userId(),
                name:Meteor.user().username,
                email:Meteor.user().emails[0].address
     }
     if(agencyPlanId==''||agencyPlanId==null||agencyPlanId==undefined){
         showError('Select Plan');
     }else{
    data.agencyModule=agencyModule;
    console.log(agencyModule)
    data.agencyPlanNumOfAppsPurchased=Number(agencyPlanNumOfAppsPurchased);
    data.agencyPlanId=agencyPlanId;
    data.agencyPlanName=agencyPlanName;
    data.agencyId = Roles.getScopesForUser(Meteor.userId())[0];
    data.agencyUserInfo = agencyUserInfo;
    data.agencyPlanDescription=agencyPlanDescription;
    data.agencyPlanFeatureList=agencyPlanFeatureList;
    data.agencyPlanGstRate=agencyPlanGstRate;
    data.agencyPlanCostPerApp=agencyPlanCostPerApp;
    data.agencyPlanFeatureName=agencyPlanFeatureName;
    data.agencyPlanAmount = agencyPlanAmount ;
    orderdata=data;
    moduleGSTString='₹'+planGST;
    GSTString=''+(Number(agencyPlanAmount)+Number(agencyModuleAmount))+''+planGST;
    if(agencyModule.length>0){
    agencyModuleAmountString=agencyModuleAmountString+'Total Module Cost :';
    for(i=0; i< data.agencyModule.length; i++){
         agencyModuleAmountString=agencyModuleAmountString+ "<br/>" +(data.agencyModule[i].agencyModuleName) + ":"+Number(data.agencyModule[i].agencyModuleNumOfModulesPurchased)+' X ₹ '+data.agencyModule[i].moduleCostPerModule+'= ₹'+Number(data.agencyModule[i].agencyModuleNumOfModulesPurchased*data.agencyModule[i].moduleCostPerModule)
         agencyModuleAmount=agencyModuleAmount+Number(data.agencyModule[i].agencyModuleNumOfModulesPurchased)*data.agencyModule[i].moduleCostPerModule
         moduleGSTString=moduleGSTString+'+ ₹'+((data.agencyModule[i].moduleGstRate*data.agencyModule[i].agencyModuleNumOfModulesPurchased*data.agencyModule[i].moduleCostPerModule)/100);
         moduleGST=moduleGST+((data.agencyModule[i].moduleGstRate*data.agencyModule[i].agencyModuleNumOfModulesPurchased*data.agencyModule[i].moduleCostPerModule)/100);
         GSTString=GSTString+''+moduleGST

    }
    agencyModuleAmountString=agencyModuleAmountString+'<br/>';
  }
    console.log('agencyModuleAmountString',agencyModuleAmountString);

    moduleGSTString=moduleGSTString+ '= ₹'+(planGST+moduleGST).toFixed(2) ;
    orderdata.agencyModuleAmount = agencyModuleAmount;
    orderdata.agencyBillingAmount = parseFloat(Math.round( (Number(agencyPlanAmount)+Number(agencyModuleAmount)+Number(moduleGST)+Number(planGST)) * 100) / 100).toFixed(2);;
    orderdata.agencyOrderStatus = 'None'
   
    $('#subscription_template_div').css('display','none');
    $('#subscription_billing_info_template_div').css('display','block');
    Session.set('showModal', true);
  }
  },  
});

Template.subscription_billing_info.events({
  'submit #agency-subscription-billing'(event, template) {
     event.preventDefault();
     var target = template.$(event.target);
     var data = target.serializeObject(); 
     if(data.agencyBillingAddressLine1==''||data.agencyBillingAddressLine2==''||data.agencyBillingCity==''||data.agencyBillingCompanyName==''||data.agencyBillingGSTNumber==''||data.agencyBillingPANNumber==''||data.agencyBillingPinCode==''||data.agencyBillingState==''){
       showError('Fill value of all fields');
     }
     else{
      submitdata = Object.assign({}, orderdata, data);
      console.log(submitdata); 
     // orderdata.billing_data = data;
     $('#subscription_billing_info_template_div').css('display','none');
     $('#subscription_summary_template_div').css('display','block');
      Session.set('showModal', true);
     }
   
 },
 'click #subscription_billing_info_form_back'(event, template){
     event.preventDefault();
     $('#subscription_template_div').css('display','block');
    $('#subscription_billing_info_template_div').css('display','none');
    $('#subscription_summary_template_div').css('display','none');
    Session.set('showModal', false);

 },
});


Template.subscription_summary.events({
   'click #subscription_summary_form_back'(event, template){
     event.preventDefault();
     $('#subscription_template_div').css('display','none');
    $('#subscription_billing_info_template_div').css('display','block');
    $('#subscription_summary_template_div').css('display','none');
    Session.set('showModal', false);

 },
 'click #subscription_summary_submit'(event, template){
    event.preventDefault();
     var date = new Date()
     submitdata.agencyPurchaseDateTime=date;  //date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+'.'+date.getMilliseconds();
    var agency=Agencies.findOne(); 


var payload = {
  purpose: 'Key Solutions Payment2',
  amount: totalAmount,
  phone: agency.contactNumber,
  buyer_name: agency.contactName,
  redirect_url: Meteor.settings.public.instamojo_redirect_url,
  send_email: false,
  webhook: Meteor.settings.public.instamojo_webhook,
  send_sms: false,
  email: agency.email,
  allow_repeated_payments: false}
   submitdata.payload=payload;
  console.log('payload',submitdata.payload);
  
    insertOrder.call(submitdata, (err, res) => { 
      if(err) {
       showError(err);  
       console.log('order error')
      }  
      else {
         showSuccess("Order Added, proceding to payment"); 
         window.location=res.payment_request.longurl;     
      }   
    });    
 }
});

Template.subscription_summary.helpers({
  showModal: function(){
    return Session.get('showModal');
    },     
  hasSelectedPlan(){
    return orderdata.agencyPlanId;
  },
  SelectedPlanList(){
    return orderdata;
  },
  hasSelectedModule(){
      return orderdata.agencyModule;
  },
  totalPlanCost(){
   return agencyPlanAmountString;
  }, 
  totalModuleCOst(){
    return agencyModuleAmountString;
  },
  TotalCost(){
  //  amount = (Number(agencyPlanAmount)+Number(agencyModuleAmount)+Number(moduleGST));
  totalAmount=parseFloat(Math.round( (Number(agencyPlanAmount)+Number(agencyModuleAmount)+Number(moduleGST)+Number(planGST)) * 100) / 100).toFixed(2);
  console.log('totalAmount',totalAmount); 
  if(agencyModuleAmount>0){
     TotalCost = "₹"+ agencyPlanAmount+"+ ₹"+agencyModuleAmount+"+ ₹"+ parseFloat(Math.round( (planGST+moduleGST) * 100) / 100).toFixed(2)  +"= ₹"+totalAmount;
  } else{
     TotalCost = "₹"+ agencyPlanAmount+"+ ₹"+ parseFloat(Math.round( (planGST+moduleGST) * 100) / 100).toFixed(2)  +"= ₹"+totalAmount;
   }
    return TotalCost;
  },
  TotalGST(){
    return moduleGSTString
  },
  
});
