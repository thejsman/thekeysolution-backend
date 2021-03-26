//start new code

import { FlowRouter } from 'meteor/kadira:flow-router';
import { Events } from '../events/events.js';

//var eventId = FlowRouter.getParam("id")
var event = Events.findOne('dsf');
var event_name = '';
if(event){
    console.log('event on server ',event, event.basicDetails.eventName);
    event_name = event.basicDetails.eventName.split(' ').join('_');
}else{
     var d = new Date();
     event_name = d.getTime();
}



export const AppConfig = new FS.Collection("appconfig", {
    stores: [
        new FS.Store.FileSystem("original", { path: "~/public/pwa_config/"+event_name }),
    ],
    filter: {
        maxSize: 100000000, //1Mo
        allow: { contentTypes: ['text/*','text/plain','application/css','application/javascript','text/javascript','text/x-scss','text/x-sass','text/css','text/scss'],extensions: ['txt','js','scss','css'] }
    },
    onInvalid: function (message) {
        //throw new Meteor.Error(403, message);
    } 
});

//end new code