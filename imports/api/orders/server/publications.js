

import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/meteor-roles';
import { Orders } from '../orders.js';

Meteor.publish('orders.all', function(id) {
  return Orders.find({});
});

Meteor.publish('orders.one', function(id) {
  return Orders.findOne(id);
});

Meteor.publish('orders.agency', function(agencyId,id) {
 return  Orders.find({$and: [{_id:id},{agencyId:agencyId}]});
});