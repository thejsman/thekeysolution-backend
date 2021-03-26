import { Meteor } from 'meteor/meteor';
import { insertActivity } from '../imports/api/activity_record/methods';

//code to insert data in Activity Record
export default (data) => {
    const activityUserInfo = {
      id: Meteor.userId(),
      name: Meteor.user().profile.name,
      email: Meteor.user().emails[0].address,
    }
    
    data.activityeDateTime = new Date();// date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+'.'+date.getMilliseconds(),
    data.activityUserInfo = activityUserInfo;
    
    insertActivity.call(data, (err, res) => {
      if (err) {
        console.log('Insert Activity record Error :: ', err)
        return 0
      } else {
        return true
      }
    })
  }