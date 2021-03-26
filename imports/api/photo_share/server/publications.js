import { Meteor } from 'meteor/meteor';
import { PhotoShareSetting, Photos } from '../photo_share.js';

Meteor.publish('photos.settings', function(id) {
  return PhotoShareSetting.find({
    eventId: id
  });
});


Meteor.publish('photos.all', function(eventId) {
  return Photos.find({
    eventId: eventId
  });
});

Meteor.publish('photos.one', function(photoId) {
  return Photos.find({
    _id : photoId
  });
});

Meteor.publish('photos.event', function(eventId, skip, searchTerm, itemPerPage, filterOption) {
  let skipCount = skip ? skip : 0
  let searchObj = { eventId : eventId }

  if (searchTerm && searchTerm !== '') {
    searchObj = {
      ...searchObj,
      $or: [
        {
          caption : new RegExp('^'+searchTerm +'.*', "i")
        }
      ]
    }
  }

  if(filterOption && filterOption !== '') {
    if(filterOption.indexOf("featured") > -1) {
      searchObj = {
        ...searchObj,
        featured : true
      }
    }

    if(filterOption.indexOf("notFeatured") > -1) {
      searchObj = {
        ...searchObj,
        featured : false
      }
    }

    if(filterOption.indexOf("featured") > -1 && filterOption.indexOf("notFeatured") > -1) {
      searchObj = {
        ...searchObj,
        featured : {
          $exists: true
        }
      }
    }

    if(filterOption.indexOf("sticky") > -1) {
      searchObj = {
        ...searchObj,
        sticky : true
      }
    }

    if(filterOption.indexOf("nonSticky") > -1) {
      searchObj = {
        ...searchObj,
        sticky : false
      }
    }

    if(filterOption.indexOf("sticky") > -1 && filterOption.indexOf("nonSticky") > -1) {
      searchObj = {
        ...searchObj,
        sticky : {
          $exists: true
        }
      }
    }

    if(filterOption.indexOf("published") > -1) {
      searchObj = {
        ...searchObj,
        status : 'published'
      }
    }

    if(filterOption.indexOf("draft") > -1) {
      searchObj = {
        ...searchObj,
        status : 'draft'
      }
    }

    if(filterOption.indexOf("published") > -1 && filterOption.indexOf("draft") > -1) {
      searchObj = {
        ...searchObj,
        status : {
          $exists: true
        }
      }
    }
  }

  return Photos.find(searchObj, {
    skip: skipCount,
    limit: itemPerPage,
    sort: {
      createdAt: -1
    }
  })
})