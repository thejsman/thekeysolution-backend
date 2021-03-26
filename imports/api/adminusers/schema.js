import SimpleSchema from 'simpl-schema';

export const AgencyInvitationsSchema = new SimpleSchema({
  email: String,
  name: String,
  username: String,
  contactNumber: String,
  assignedPlanInfo:Object,
  'assignedPlanInfo.planId':String,
  'assignedPlanInfo.appCount':{type:Number, min:1},
  assignedModuleInfo:{type:Array,optional:true},
  'assignedModuleInfo.$':{type:String}
});

export const AdminUserInvitationSchema = new SimpleSchema({
  email: String,
  agency: String,
  username: String,
  contactNumber: String,
  role: {
    type: String,
    allowedValues: ['admin', 'member', 'client', 'freelancer']
  },
  'selectedEvents': { type: Array, optional: true },
  'selectedEvents.$': String
});

export const InvitationAcceptSchema = new SimpleSchema({
  password: Object,
  'password.algorithm': String,
  'password.digest': String,
  token: String
});
