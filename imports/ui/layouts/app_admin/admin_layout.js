import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import '../../pages/footer/footer.js';
import '../../components/navbar/side_navbar.js';
import '../../components/navbar/top_navbar.js';
import './admin_layout.scss';
import './admin_layout.html';


Template.admin_layout.onRendered(function() {
  Meteor.subscribe('admin.agency');
  Meteor.subscribe('airports.all');
  Meteor.subscribe('airlines.all');
  this.autorun(() => {
    var loggedIn = Meteor.user() || Meteor.loggingIn();
    if(!loggedIn) {
      FlowRouter.go('/');
    }
  });
});
