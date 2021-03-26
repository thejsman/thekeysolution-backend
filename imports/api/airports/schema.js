// Time-stamp: 2017-08-02 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : schema.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import SimpleSchema from 'simpl-schema';

export const AirportsSchema = new SimpleSchema({
  airportId: {
    type: String,
    optional: true
  },
  airportName: String,
  airportCountry: String,
  airportIATA: String,
  airportLocation: String
});
