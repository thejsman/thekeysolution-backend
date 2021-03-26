import { Meteor } from 'meteor/meteor';
import { insertActivity } from '../../../../api/activity_record/methods.js';

export const ActivityUpdate = (activityModule,activitySubModule,activityMessage,activityEvent) => {
	console.log('in activity update')
      var date = new Date();
     var activityUserInfo={
        id:Meteor.userId(),
        name:Meteor.user().profile.name,
        email:Meteor.user().emails[0].address,
      }
      userdata={
        activityeDateTime:date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+'.'+date.getMilliseconds(),
        activityUserInfo:activityUserInfo,
        activityModule:activityModule,
        activitySubModule:activitySubModule,
        activityEvent:activityEvent,
        activityMessage:activityMessage
      }
      console.log('userdata',userdata)
      insertActivity.call(userdata, (err, res) => {
      if(err) {
        console.log('error',err);
        return 0;
      }
      else {
        console.log('activity updated');
        return true;
      }
    });
};
