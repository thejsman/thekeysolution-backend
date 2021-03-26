// Time-stamp: 2017-08-14 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : admin_home.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------

import { MultiPage } from '../../components/multipage/multipage.js';
import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import './admin_landing.html';

Template.admin_landing.onRendered(function() {
  let multiElement = this.$('.multipage');
  let multiPage = new MultiPage(multiElement, {
    onPageSubmit(index, page, callback) {
      console.log(index, page);
      Meteor.setTimeout(callback, 1000);
    }
  });
});
