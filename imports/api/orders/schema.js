

import SimpleSchema from 'simpl-schema';

export const OrdersSchema = new SimpleSchema({
  orderId: {
    type: String,
    optional: true
  },
  agencyId: { type: String },
  agencyPlanId: { type: String },
  agencyPlanName: { type: String },
  agencyPlanNumOfAppsPurchased: { type: Number, min:0 },
  agencyPlanGstRate: {type: Number, min:0},
  agencyPlanCostPerApp: {type: Number, min:0}, 
  agencyPlanFeatureList : { type: Array },
  agencyPlanFeatureName : { type: String },
  agencyModule : { type : Array },
  'agencyModule.$': Object,
  'agencyModule.$.agencyModuleId': { type: String },
  'agencyModule.$.agencyModuleName': { type: String },
  'agencyModule.$.agencyModuleNumOfModulesPurchased': { type: Number, min:0 },
  'agencyModule.$.agencyModuleDescription': { type: String },
  'agencyModule.$.moduleCostPerModule': { type: Number, min:0 },
  'agencyModule.$.moduleGstRate': { type: Number, min:0 },
  agencyBillingCompanyName: { type : String },
  agencyBillingAddressLine1: { type : String },
  agencyBillingAddressLine2: { type : String },
  agencyBillingCity: { type : String },
  agencyBillingState: { type : String },
  agencyBillingPinCode: { type : String },
  agencyBillingPANNumber: { type : String },
  agencyBillingGSTNumber: { type : String },
  agencyPurchaseDateTime: { type : Date },
  agencyPaymentId: { type: String, optional: true },
  agencyPaymentRequestId : { type:String },
  agencyModuleAmount: { type : Number, optional: true },
  agencyPlanAmount: { type : Number, optional: true },
  agencyBillingAmount: { type : Number, optional: true },
  agencyOrderStatus: { type : String, defaultValue:'None' },
  agencyUserInfo: Object,
  'agencyUserInfo.id': String,
  'agencyUserInfo.name': String,
  'agencyUserInfo.email': String, 
});
