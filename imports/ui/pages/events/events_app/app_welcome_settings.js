import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import './app_welcome_settings.html'

Template.app_welcome_settings.onRendered(()=>{
  this.$('select').material_select();
  this.$('.dropify').dropify();
});
