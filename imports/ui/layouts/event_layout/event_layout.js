// Time-stamp: 2017-08-25 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : event_layout.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------

import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Events } from '../../../api/events/events.js';
import '../../components/navbar/side_navbar_events.js';
import './event_layout.scss';
import './event_layout.html';

Template.event_layout.onRendered(function() {
  let sub = this.subscribe('events.one', FlowRouter.getParam("id"));
  let app = this.subscribe('appgeneral.event', FlowRouter.getParam("id"));
});
