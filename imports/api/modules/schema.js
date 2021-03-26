

import SimpleSchema from 'simpl-schema';

export const ModulesSchema = new SimpleSchema({
	moduleId: {
    type: String,
    optional: true
  },
  moduleName: { type: String },
  moduleDescription: { type: String},
  moduleCostPerModule: { type: Number, min:0 },
  moduleGstRate: {type: Number, min:0, max:100},
  moduleIsStatusInactive: {type:Boolean,defaultValue:false},
  moduleIsAvailableForSpecificAgency: {type:Boolean,defaultValue:false},
  moduleAgencyList : { type : Array, optional : true },
  'moduleAgencyList.$': { type: String },
});

