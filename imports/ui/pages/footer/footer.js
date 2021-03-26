import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';

// import '../../components/login/login.js';
import './footer.scss';
import './footer.html';
import './about.html';
import './contact.html';
import './tnc.html';
import './eula.html';
import './privacy-policy.html';

Template.common_footer.helpers({
  aboutUs() {
    return FlowRouter.path('key.about');
  },
  contactUs() {
    return FlowRouter.path('key.contact');
  },
  tnc() {
    return FlowRouter.path('key.tnc');
  },
  privacy() {
    return FlowRouter.path('key.privacy');
  },
  refundPolicy(){
    return FlowRouter.path('key.refund');
  },
  deliveryPolicy(){
    return FlowRouter.path('key.delivery');
  },
  eula(){
    return FlowRouter.path('key.eula');
  }
});

Template.our_terms.helpers({
  contactUs() {
    return FlowRouter.path('key.contact');
  }
});

Template.privacy_policy.helpers({
  contactUs() {
    return FlowRouter.path('key.contact');
  }
});
Template.delivery_policy.helpers({
  contactUs() {
    return FlowRouter.path('key.contact');
  }
});
Template.refund_policy.helpers({
  contactUs() {
    return FlowRouter.path('key.contact');
  }
});