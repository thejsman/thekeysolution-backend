import SimpleSchema from 'simpl-schema';

export const PhotoShareSchema = new SimpleSchema({
  eventId: String,
  url: String,
  sticky: { type: Boolean, defaultValue:false },
  status: String,
  caption : {
    type : String,
    optional : true
  },
  featured : {type: Boolean, defaultValue:false },
  groupId : {
    type : String,
    optional : true,
    defaultValue : null
  },
  createdAt : String,
  createdBy : String,
  isDeleted: { type: Boolean, defaultValue:false }
})

export const PhotoEditSchema = new SimpleSchema({
  photoId: String,
  eventId: String,
  url: {
    type : String,
    optional : true
  },
  sticky: { type: Boolean, defaultValue:false },
  status: String,
  caption :  {
    type : String,
    optional : true
  },
  featured : {type: Boolean, defaultValue:false },
  groupId : {
    type : String,
    optional : true,
    defaultValue : null
  },
  updatedBy : String,
  updatedAt : String,
  createdBy : { type : String, optional : true },
  isDeleted: { type: Boolean, defaultValue:false }
});

export const PhotoShareSettingSchema = new SimpleSchema({
  eventId: String,
  host: String,
  download: {type: Boolean, defaultValue:false},
  like: {type: Boolean, defaultValue:false},
  share: {type: Boolean, defaultValue:false},
  comment : {type: Boolean, defaultValue:false}
})