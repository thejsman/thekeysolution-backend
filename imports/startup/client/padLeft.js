// Time-stamp: 2017-08-12 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : padLeft.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------


import { Template } from 'meteor/templating';

Template.registerHelper('padLeft', (nr, n, str) => {
  return Array(n - String(nr).length + 1).join('0') + nr;
});
