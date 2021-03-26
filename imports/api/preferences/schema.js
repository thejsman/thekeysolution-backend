import SimpleSchema from 'simpl-schema';

export const FoodPreferenceSchema = new SimpleSchema({
  eventId: String,
  foodSectionStatement: String,
  foodPreferences: Array,
  'foodPreferences.$': String,
  foodSectionRemarks: { type: String, optional: true }
});

export const SpecialAssistancePreferenceSchema = new SimpleSchema({
  eventId: String,
  assistanceSectionStatement: String,
  assistanceOptions: Array,
  'assistanceOptions.$': String,
  assistanceRemarks: { type: String, optional: true }
});

export const SizePreferenceSchema = new SimpleSchema({
  eventId: String,
  sizeName: String,
  sizeSectionStatement: String,
  sizePreferences: Array,
  'sizePreferences.$': String,
  sizeSectionRemarks: { type: String, optional: true }
});


export const GuestPreferencesSchema = new SimpleSchema({
  guestId: String,
  foodPreference: { type: String, optional: true },
  foodPreferencesRemark: { type: String, optional: true },
  sizePreference: { type: String, optional: true },
  sizePreferenceRemark: { type: String, optional: true },
  specialAssistance: { type: Array, optional: true },
  'specialAssistance.$': String,
  specialAssistanceRemark: { type: String, optional: true }
});

export const RoomPreferenceSchema = new SimpleSchema({
  guestId: String,
  smoking: {
    type: Boolean,
    defaultValue: false
  },
  doubleOccupancy: {
    type: Boolean,
    defaultValue: false
  },
  adjoining: {
    type: Boolean,
    defaultValue: false
  },
  noOfAdults: {
    type: SimpleSchema.Integer,
    defaultValue: 0
  },
  noOfKids: {
    type: SimpleSchema.Integer,
    defaultValue: 0
  },
  noOfRooms: {
    type: SimpleSchema.Integer,
    defaultValue: 0
  }
});
