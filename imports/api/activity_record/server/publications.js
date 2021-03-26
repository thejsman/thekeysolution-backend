import { Meteor } from 'meteor/meteor';
import { ActivityRecords } from '../activity_record.js';
import { activityPerPage } from '../activityPerPage.js';

Meteor.publish('activity.all', function (id) {
  return ActivityRecords.find({});
});

Meteor.publish('activity.event', function (eid, skip, searchTerm) {
  let skipCount = skip ? skip : 0;
  let searchObj = {activityEventId : eid};

  if (searchTerm && searchTerm !== '') {
    searchObj = {
      ...searchObj,
      $or: [
        {
          "activityUserInfo.name": new RegExp('^'+searchTerm +'.*', "i")
        }
      ]
    };
  }
  return ActivityRecords.find(searchObj, {
    skip: skipCount,
    limit: activityPerPage,
    sort: {
      activityeDateTime: -1
    }
  });
});