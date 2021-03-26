import { OrderCount } from './orderCount.js';

export const IncrementOrderCount = function(agencyId) {
  var countObj = OrderCount.findOne({
    agencyId: agencyId
  });
  var count = 0;
  if (countObj) {
    OrderCount.update({
      agencyId: agencyId
    }, {
      $inc: {
	count: 1
      }
    });
    count = countObj.count + 1;
  }
  else {
    OrderCount.insert({
      agencyId: agencyId,
      count: 1
    });
    count = 1;
  }
  return count;
};
