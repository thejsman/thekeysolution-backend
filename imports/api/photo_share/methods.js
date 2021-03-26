import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { PhotoShareSchema, PhotoEditSchema, PhotoShareSettingSchema} from './schema.js';
import { Photos, PhotoShareSetting} from './photo_share.js'
import { Roles } from 'meteor/meteor-roles';

// Insert and update Photo Share Setting
export const photoShareSetting = new ValidatedMethod({
  name: "photoShareSetting",
  validate: PhotoShareSettingSchema.validator({ clean: true }),
  run (data) {
    PhotoShareSetting.upsert({
      eventId: data.eventId
    }, {
      $set: data
    })
  }
})

export const addPhotos = new ValidatedMethod({
  name: "addPhotos",
  validate: PhotoShareSchema.validator({ clean: true }),
  run (data) {
    Photos.insert(data)
  }
})

export const editPhotos = new ValidatedMethod({
  name: "editPhotos",
  validate: PhotoEditSchema.validator({ clean: true }),
  run (data) {
    Photos.update({
      _id: data.photoId
    }, {
      $set: data
    })
  }
})

export const deletePhotos = new ValidatedMethod({
  name: "deletePhotos",
  validate: null,
  run (id) {
    Photos.update({
      _id: id
    }, {
      $set: {
        isDeleted : true
      }
    })
  }
})

export const getPhotosCount = new ValidatedMethod({
  name : "getPhotosCount",
  validate : null,
  run ({ eventId, searchTerm, filterOption }) {

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
    
    return Photos.find(searchObj).count()
  }
})