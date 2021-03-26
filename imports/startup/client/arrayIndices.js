// Time-stamp: 2017-07-31 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : arrayIndices.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Template } from 'meteor/templating';

Template.registerHelper('indexPlusOne', (index) => {
  return index + 1;
});

Template.registerHelper('indexPlusFour', (index) => {
  return index + 5;
});