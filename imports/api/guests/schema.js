import SimpleSchema from "simpl-schema";
export const GuestMemberSchema = new SimpleSchema(
  {
    guestMemberId: {
      type: String,
      optional: true,
    },
    eventId: String,
    guestFirstName: String,
    guestAddressing: { type: String, optional: true },
    guestRemarks: { type: String, optional: true },
    guestSecretaryName: { type: String, optional: true },
    guestSecretaryContactNo: { type: String, optional: true },
    guestSecretaryEmail: { type: String, optional: true },
    guestAddress1: { type: String, optional: true },
    guestAddress2: { type: String, optional: true },
    guestAddressNationality: { type: String, optional: true },
    guestAddressCity: { type: String, optional: true },
    guestAddressState: { type: String, optional: true },
    guestAddressPincode: { type: String, optional: true },
    guestAddressLandmark: { type: String, optional: true },
    guestRSVPStatus: { type: String, optional: true },
    guestNearestAirport: { type: String, optional: true },
    guestLastName: String,
    guestTitle: { type: String, optional: true },
    guestRelation: String,
    guestPhoneCode: { type: String, optional: true },
    guestContactNo: { type: String, optional: true },
    guestPhoneNo: { type: SimpleSchema.Integer, optional: true },
    guestPersonalEmail: { type: String, optional: true },
    guestIsPrimary: {
      type: Boolean,
      defaultValue: false, // not visable if not explicitly told
    },
    guestInviteSent: {
      type: Boolean,
      defaultValue: false, // not visable if not explicitly told
    },
    freeFlightTicket: {
      type: Boolean,
      defaultValue: true,
    },
    freeHotelRoom: {
      type: Boolean,
      defaultValue: true,
    },
    guestFamilyID: String,
    guestGender: String,
    guestDOB: { type: String, optional: true },
  },
  {
    clean: {
      removeEmptyStrings: false,
      trimStrings: false,
    },
  }
);

export const NewGuestSchema = new SimpleSchema({
  guestId: {
    type: String,
    optional: true,
  },
  eventId: String,
  guestFirstName: String,
  guestAddressing: { type: String, optional: true },
  guestRemarks: { type: String, optional: true },
  guestSecretaryName: { type: String, optional: true },
  guestSecretaryContactNo: { type: SimpleSchema.Integer, optional: true },
  guestSecretaryEmail: { type: String, optional: true },
  guestAddress1: { type: String, optional: true },
  guestAddress2: { type: String, optional: true },
  guestAddressNationality: { type: String, optional: true },
  guestAddressCity: { type: String, optional: true },
  guestAddressState: { type: String, optional: true },
  guestAddressPincode: { type: String, optional: true },
  guestAddressLandmark: { type: String, optional: true },
  guestRSVPStatus: { type: String, optional: true },
  guestNearestAirport: { type: String, optional: true },
  guestLastName: String,
  guestTitle: { type: String, optional: true },
  guestContactNo: { type: String, optional: true },
  guestPhoneCode: { type: String, optional: true },
  guestPhoneNo: { type: SimpleSchema.Integer, optional: true },
  guestPersonalEmail: { type: String, optional: true },
  guestOfficialEmail: { type: String, optional: true },
  guestIsRegistered: { type: Array, defaultValue: [] },
  guestIsPrimary: {
    type: Boolean,
    defaultValue: true, // not visable if not explicitly told
  },
  guestInviteSent: {
    type: Boolean,
    defaultValue: false, // not visable if not explicitly told
  },
  guestFamilyID: String,
  canBringCompanion: {
    type: Boolean,
    defaultValue: false,
  },
  freeFlightTicket: {
    type: Boolean,
    defaultValue: true,
  },
  freeHotelRoom: {
    type: Boolean,
    defaultValue: true,
  },
  guestGender: { type: String, optional: true },
  guestDOB: { type: String, optional: true },
});

export const GuestPassportSchema = new SimpleSchema({
  guestId: String,
  guestNationality: { type: String, optional: true },
  guestPhotoID: { type: String, optional: true },
  guestPassportNumber: { type: String, optional: true },
  guestDOB: { type: String, optional: true },
  guestPassportPlaceOfIssue: { type: String, optional: true },
  guestPassportIssueDate: { type: String, optional: true },
  guestPassportAddress: { type: String, optional: true },
  guestPassportExpiryDate: { type: String, optional: true },
});

export const GuestVisaSchema = new SimpleSchema({
  guestId: String,
  guestValidTill: { type: String, optional: true },
  guestCountryIssue: { type: String, optional: true },
  guestTypeOfVisa: { type: String, optional: true },
  guestValidFrom: { type: String, optional: true },
  guestValidVisa: { type: Boolean, optional: true },
  guestVisaNumber: { type: String, optional: true },
});

export const GuestInsuranceSchema = new SimpleSchema({
  guestId: String,
  insuranceTitle: { type: String, optional: true },
  insuranceFirstName: { type: String, optional: true },
  insuranceMiddleName: { type: String, optional: true },
  insuranceLastName: { type: String, optional: true },
  insuranceRelation: { type: String, optional: true },
  validInsurance: { type: Boolean, optional: true },
});

// ABL SAM BOC : NEW SCHEMA FOR WISHES AND FEEDBACK

export const GuestWishSchema = new SimpleSchema({
  guestId: String,
  guestWish: { type: String, optional: true },
});
export const GuestFeedbackSchema = new SimpleSchema({
  guestId: String,
  guestFeedbacks: { type: Array, optional: true },
  "guestFeedbacks.$": Object,
  "guestFeedbacks.$.question": String,
  "guestFeedbacks.$.response": String,
});

// ABL SAM EOC : NEW SCHEMA FOR WISHES AND FEEDBACK
