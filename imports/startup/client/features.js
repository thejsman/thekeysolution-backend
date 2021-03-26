import { Template } from 'meteor/templating'
import { Events } from '../../api/events/events'

Template.registerHelper('hasFeature', function (featureName) {
  let event = Events.findOne()
  let features = []
  let selectedFeatures = event && event.featureDetails.selectedFeatures
  let selectedAppDetails = event && event.appDetails.selectedAppDetails
  let selectedAppPreferences = event && event.appDetails.selectedAppPreferences
  _.map(selectedFeatures, (a) => { features.push(a)})
  _.map(selectedAppDetails, (a) => { features.push(a)})
  _.map(selectedAppPreferences, (a) => { features.push(a)})
  if(features && features.length > 0) {
    return features.indexOf(featureName) > -1;
  }
  return false
});