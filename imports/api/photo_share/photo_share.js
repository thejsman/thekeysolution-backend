import { Mongo } from 'meteor/mongo';

export const PhotoShareSetting = new Mongo.Collection('photos_share_settings');

export const Photos = new Mongo.Collection('photos_share');