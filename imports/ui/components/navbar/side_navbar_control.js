// Time-stamp: 2017-08-14 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : side_navbar_control.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Roles } from 'meteor/meteor-roles';
import { HasRole } from '../../../extras/hasRole.js';

import './navbar.scss';
import './side_navbar_control.html';

Template.left_navbar_control.onRendered(function(){
  Meteor.setTimeout(() => {
    this.$('.collapsible').collapsible();
    this.$('.tooltip-icon').tooltip({delay: 50});
  },10);

});
Template.left_navbar_control.helpers({
  packageList() {
    return Roles.userIsInRole(Meteor.userId(), 'view-packages');
  },
  packageRoute() {
    return FlowRouter.path('admin.control.packages');
  },

  agencyList() {
    return Roles.userIsInRole(Meteor.userId(),'agency-list');
  },

  agencyRoute() {
    return FlowRouter.path('admin.control.agencies');
  },

  airlineList() {
    return Roles.userIsInRole(Meteor.userId(), 'airlines-list');
  },

  airlineRoute() {
    return FlowRouter.path('admin.control.airlines');
  },

  airportRoute() {
    return FlowRouter.path('admin.control.airports');
  },

  airportList() {
    return Roles.userIsInRole(Meteor.userId(), 'airport-list');
  },

  userRoute() {
    return FlowRouter.path('admin.control.users');
  },
  
  userList() {
    return HasRole(Meteor.userId(), 'user-list');
  },

  planRoute() {
     return FlowRouter.path('admin.control.plan');
  }, 

  addPlans(){
    return Roles.userIsInRole(Meteor.userId(), 'add-plans');
  },

  addModules(){
    return Roles.userIsInRole(Meteor.userId(), 'add-modules');
  },

  featureRoute(){
     return FlowRouter.path('admin.control.feature');
  },

  featureList() {
    return Roles.userIsInRole(Meteor.userId(), 'feature-bank');
  },

  moduleRoute(){
    return FlowRouter.path('admin.control.module');
  },

  agencySubscription() {
    if(Roles.userIsInRole(Meteor.userId(), 'superadmin') ){
      return false;
    }
    return HasRole(Meteor.userId(), 'agency-subscription');
  },

  subscriptionRoute(){
    return FlowRouter.path('admin.control.subscription');
  },

  agencyOrder() {
    if(Roles.userIsInRole(Meteor.userId(), 'superadmin') ){
    return false;
  }
  return HasRole(Meteor.userId(), 'agency-orders');
  },
  assignPlanList(){
    return Roles.userIsInRole(Meteor.userId(), 'view-assigned-plan');
  },
  assignedPlanRoute(){
    return FlowRouter.path('admin.control.assignedPlans');
  },
  assignedModuleRoute(){
    return FlowRouter.path('admin.control.assignedModules');
  },
  orderRoute(){
    return FlowRouter.path('admin.control.order');
  },

  activityRecordList(){
    return Roles.userIsInRole(Meteor.userId(), 'activity-record-list');
  },
  activityRecordRoute(){
    return FlowRouter.path('admin.control.activity_record');
  },
  notSuperAdmin(){
    return !Roles.userIsInRole(Meteor.userId(), 'superadmin');
  },

});
