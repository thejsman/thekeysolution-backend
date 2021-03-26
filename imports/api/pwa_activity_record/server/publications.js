import { Meteor } from 'meteor/meteor';
import { PwaActivityRecords as ActivityRecords } from '../activity_record.js';
import { pwaActivityPerPage as activityPerPage } from '../activityPerPage.js';

Meteor.publish('pwa.activity.all', function(id) {
  return ActivityRecords.find({});
});

Meteor.publish('pwa.activity.search', function(eid, skip, searchTerm) {
  let skipCount = skip ? skip : 0;
  let searchObj = {activityEventId : eid};

  if (searchTerm && searchTerm !== '') {
    searchObj = {
      ...searchObj,
      $or: [
        {
          "activityGuestInfo.name": new RegExp('^'+searchTerm +'.*', "i")
        }
      ]
    };
  }
  return ActivityRecords.find(searchObj, {
    skip : skipCount,
    limit: activityPerPage,
    sort: {
      activityeDateTime: -1
    }
  });
});