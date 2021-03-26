// Time-stamp: 2017-08-13 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : addAgency.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------

import { Agencies } from '../agencies.js';

export const addAgency = (agency) => {
  var existing = Agencies.findOne({
    name: agency.name
  });

  if(existing) {
    return existing._id;
  }

  var id = Agencies.insert(agency);
  return id;
};

