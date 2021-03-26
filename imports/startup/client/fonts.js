import { Meteor } from 'meteor/meteor';
import WebFont from 'webfontloader';

Meteor.startup(() => {
  WebFont.load({
    google: {
      families: [
	'Nunito:regular,bold',
	'Arima Madurai:regular,bold,italic',
	'Vollkorn:regular,bold,italic',
	'Ovo:regular,bold,italic',
	'Yrsa:regular,bold,italic,light',
	'Great Vibes:regular,bold,italic',
	'Satisfy:regular,bold,italic',
	'Scope One:regular,bold,italic'
      ]
    }
  });
});
