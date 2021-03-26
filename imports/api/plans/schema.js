import SimpleSchema from 'simpl-schema';

export const PlansSchema = new SimpleSchema({
	planId: {
    type: String,
    optional: true
  },
  planName: { type: String },
  planDescription: { type: String},
  planFeatures: [String],
  planMinNumOfApp: {type: Number, min:0},
  planMaxNumOfApp: {type: Number, min:0},
  planCostPerApp: { type: Number, min:0 },
  planGstRate: {type: Number, min:0, max:100},
  planIsStatusInactive: {type:Boolean,defaultValue:false},
  planIsAvailableForSpecificAgency: {type:Boolean,defaultValue:false},
  planAgencyList : { type : Array, optional : true },
  'planAgencyList.$': { type: String },
  planSequenceNumber: {type:Number, min:1}
});

