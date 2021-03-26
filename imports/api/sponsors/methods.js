import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Events } from '../../api/events/events'
import { SponsorSchema } from './schema.js'
import { Sponsors } from './sponsors'
import { Roles } from 'meteor/meteor-roles'
import { insertActivity } from '../../api/activity_record/methods.js'

let isAllowed = (userId, role) => {
  let scopes = Roles.getScopesForUser(userId)
  if (scopes.length > 0) {
    for (var i = 0; i < scopes.length; i++) {
      if (Roles.userIsInRole(userId, role, scopes[i])) {
        return true
      }
    }
    return false
  }
  return Roles.userIsInRole(userId, role)
}

//code to insert data in Activity Record
function activityRecordInsert(data) {
  var activityEvent = ''
  var activityUserInfo = {
    id: Meteor.userId(),
    name: Meteor.user().profile.name,
    email: Meteor.user().emails[0].address,
  }
  if (data.eventId == null || data.eventId == '' || data.eventId == undefined) {
    activityEvent = 'general'
  } else {
    var event = Events.findOne(data.eventId)
    activityEvent = event.basicDetails.eventName
  }
  var date = new Date()
  userdata = {
    activityeDateTime: date, //date.getFullYear()+'-'+date.getMonth()+'-'+date.getDate()+' '+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()+'.'+date.getMilliseconds(),
    activityUserInfo: activityUserInfo,
    activityModule: data.activityModule,
    activitySubModule: data.activitySubModule,
    activityEvent: activityEvent,
    activityMessage: data.activityMessage,

  }
  insertActivity.call(userdata, (err, res) => {
    if (err) {
      console.log('Insert Activity record Error :: ', err)
      return 0
    } else {
      return true
    }
  })
}

export const insertSponsor = new ValidatedMethod({
  name: "Sponsors.methods.insert",
  validate: SponsorSchema.validator({
    clean: true
  }),
  run(sponsorNew) {
    var event = Events.findOne({
      _id: sponsorNew.eventId
    })

    if (event) {
      Sponsors.insert(sponsorNew)
    } else {
      throw new Meteor.Error("Event Id Invalid")
    }
  }
})

export const updateSponsor = new ValidatedMethod({
  name: "Sponsors.methods.update",
  validate: SponsorSchema.validator({
    clean: true
  }),
  run(sponsorUpdate) {
    if (!isAllowed(this.userId, 'edit-sponsor')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS")
    } else{
      Sponsors.update(sponsorUpdate.sponsorId, {
        $set: sponsorUpdate
      })
    }
  }
})


export const deleteSponsor = new ValidatedMethod({
  name: "Sponsors.methods.delete",
  validate: null,
  run(id) {
    if (!isAllowed(this.userId, 'delete-sponsor')) {
      throw new Meteor.Error("NO PERMISSIONS FOR THIS")
    }
    let sponsors = Sponsors.find({
      _id: id
    })
    let user = Meteor.user()
    Sponsors.remove(id)
    var activityInsertData = {
      eventId: sponsors.eventId,
      activityModule: 'Guests',
      activitySubModule: 'Sponsors',
      event: 'delete',
      activityMessage: 'Sponsor is deleted by ' + user.profile.name + ', userId: ' + user._id
    }
    activityRecordInsert(activityInsertData)
  }
})