// Time-stamp: 2017-08-02
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';

export const AirlinesSchema = new SimpleSchema({
  airlineId: {
    type: String,
    optional: true
  },
  airlineName: String,
  airlineCountry: String,
  airlineIATA: String,
  airlineType: String
});
