import SimpleSchema from 'simpl-schema';

export const App_general_Schema = new SimpleSchema({
  eventId: { type: String },
  appLogo: {type: String,optional:true},
  appBackground: {type: String,optional:true},
  appName: {type: String},
  appShortName: {type: String},
  appHeadingFont: {type: String},
  appBodyFont: {type: String},
  appColor1: {type: String},
  appColor2: {type: String},
  appColor5: {type: String, optional: true},
  appColor6: {type: String},
  firebaseID: { type: String, optional: true},
  instagramLink: { type: String, optional: true},
  facebookLink: { type: String, optional: true},
  twitterLink: { type: String, optional: true},
  ppLink: { type: String, optional: true},
  tncLink: { type: String, optional: true},
  androidLink: { type: String, optional: true},
  iosLink: { type: String, optional: true},
  isDefaultAppBackground:{ type: Boolean, optional: true},
  appDomain: {type: String, optional: true},
  featureGuestInfo : {type: Array, optional: true},
  'featureGuestInfo.$' : String
});

export const AppWelcomeSchema = new SimpleSchema({
  eventId: { type: String },
  welcomeImage: {type: String,optional:true},
  welcomeBackground: {type: String,optional:true},
  welcomeTitle: String,
  welcomeMessage: String,
  welcomeVideo: { type: String, defaultValue: ''},
  appColor3: {type: String,optional:true},
  appColor4: {type: String,optional:true},
  feedbackQuestions: { type: Array, optional: true},
  'feedbackQuestions.$': String,

  // wishesQuestion: { type: String, optional: true },

  visaQuestion: { type: String, optional: true}
});
// ABL SAM EDIT
export const AppWishFeedbackSchema = new SimpleSchema({
  eventId: { type: String },

  showVisaSection:{type:Boolean,optional:true,defaultValue:false},
  visaQuestion:{type:String,optional:true},
  showPassportSection:{type:Boolean,optional:true,defaultValue:false},
  passportQuestion:{type:String,optional:true},
  showFeedback:{type:Boolean,defaultValue:false},
  wishesTitle:{type:String,optional:true},
  wishesDescription:{type:String,optional:true},
  feedbackQuestions: { type: Array, optional: true},
  'feedbackQuestions.$': String,
});

// export const AppGuestInfoSchema = new SimpleSchema({
//   featureGuestInfo : {type: Array, optional: true},
//   'featureGuestInfo.$' : String
// });

export const AppAboutSchema = new SimpleSchema({
  eventId: { type: String },
  aboutPageBackground: {type: String,optional:true},
  aboutPageMainbanner: {type: String,optional:true},
  aboutPageSubBanner1: {type: String,optional:true},
  aboutPageSubBanner2: {type: String,optional:true},
  aboutPageTitle: String,
  aboutPageMainMessage: String,
  aboutPageSubTitle1: String,
  aboutPageSubDescription1: String,
  aboutPageSubTitle2: String,
  aboutPageSubDescription2: String
});

export const AppAboutPageSchema = new SimpleSchema({
  eventId: { type: String },
  aboutPageId: {type: String, optional:true},
  aboutPageSequence: {type: String},
  aboutPageImg: {type: String},
  aboutPageTitle: String,
  aboutPageContent: String
});

export const AppContactSchema = new SimpleSchema({
  eventId: { type: String },
  // contactTitle: String,
  contactBackground: {type: String,optional:true},
  contactItems: {type: Array},
  'contactItems.$': Object,
  'contactItems.$.name': { type: String, optional: true},
  'contactItems.$.number': { type: String, optional: true }
});


export const AppItinerarySchema = new SimpleSchema({
  eventId: { type: String },
  itineraryBackground: {type: String,optional:true},
  itineraryList: {type: Array},
  'itineraryList.$': Object,
  'itineraryList.$._id': String,
  'itineraryList.$.date': String,
  'itineraryList.$.subEventId': { type: String, optional: true },
  'itineraryList.$.startTime': String,
  'itineraryList.$.endTime': String,
  'itineraryList.$.selectIcon': String,
  'itineraryList.$.description': String
});

export const AppItineraryItemSchema = new SimpleSchema({
  _id: { type: String, optional : true},
  date: String,
  subEventId: { type: String, optional: true },
  startTime: String,
  endTime: String,
  description: String,
  selectIcon: String
});

export const AppDestinationSchema = new SimpleSchema({
  eventId: { type: String },
  destinationId: { type: String, optional: true },
  mainImage: String,
  basicInfo: Object,
  'basicInfo.destinationName': String,
  'basicInfo.aboutDestination': String,
  otherDetails: { type: Object, optional : true },
  otherDetailsInclude: { type: Boolean, defaultValue: false },
  otherDetailsImage: {
    type: String, optional: true,
    custom() {
      if(this.field('otherDetails').value && !this.value) {
        return SimpleSchema.ErrorTypes.REQUIRED;
      }
    }
  },
  'otherDetails.destinationAirportName': String,
  'otherDetails.destinationTimezone': String,
  'otherDetails.destinationWeatherMax': String,
  'otherDetails.destinationWeatherMin': String,
  'otherDetails.destinationCurrency': { type: Array, optional: true },
  'otherDetails.destinationCurrency.$':{ type: Object, optional: true }, 
  'otherDetails.destinationCurrency.$.from': { type: String, optional: true },
  'otherDetails.destinationCurrency.$.to': { type: String, optional: true },
  'otherDetails.destinationCurrency.$.rate': { type: String, optional: true },
  'destinationTips': { type: Object, optional: true },
  destinationTipsInclude: { type: Boolean, defaultValue: false },
  'tipsImage': {
    type: String,
    optional: true,
    custom() {
      if(this.field('destinationTips').value && !this.value) {
  return SimpleSchema.ErrorTypes.REQUIRED;
      }
    }
  },
  'destinationTips.destinationDos': Array,
  'destinationTips.destinationDos.$': String,
  'destinationTips.destinationDonts': Array,
  'destinationTips.destinationDonts.$': String,
  'placesToVisit': { type: Object, optional : true },
   placesToVisitInclude: { type: Boolean, defaultValue: false },
  'placesToVisitImage1': {
    type: String,
    optional: true,
    custom() {
      let val = this.field('placesToVisit').value;
      
      if(val)
      if((val.destinationPlacesToVisit[0].title) && (val.destinationPlacesToVisit[0].description) && !this.value) {
  return SimpleSchema.ErrorTypes.REQUIRED;
      }
    }
  },
  'placesToVisitImage2': {
    type: String,
    optional: true,
    custom() {
      let val = this.field('placesToVisit').value;
    
      if(val)
      if((val.destinationPlacesToVisit[1].title) && (val.destinationPlacesToVisit[1].description) && !this.value) {
  return SimpleSchema.ErrorTypes.REQUIRED;
      }
    }
  },
  'placesToVisitImage3': {
    type: String,
    optional: true,
    custom() {
      let val = this.field('placesToVisit').value;
      if(val)
      if((val.destinationPlacesToVisit[2].title) && (val.destinationPlacesToVisit[2].description) && !this.value){
  return SimpleSchema.ErrorTypes.REQUIRED;
      }
    }
  },
  'placesToVisit.destinationPlacesToVisit': Array,
  'placesToVisit.destinationPlacesToVisit.$': { type: Object, optional: true },
  'placesToVisit.destinationPlacesToVisit.$.title': { type: String, optional: true },
  'placesToVisit.destinationPlacesToVisit.$.description': { type: String, optional: true },
});
