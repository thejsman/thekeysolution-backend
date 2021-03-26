import { GuestCount } from './guestCount.js';

export const IncrementGuestCount = function(eventId) {
  var countObj = GuestCount.findOne({
    eventId: eventId
  });
  var count = 0;
  if (countObj) {
    GuestCount.update({
      eventId: eventId
    }, {
      $inc: {
	count: 1
      }
    });
    count = countObj.count + 1;
  }
  else {
    GuestCount.insert({
      eventId: eventId,
      count: 1
    });
    count = 1;
  }
  return count;
};
