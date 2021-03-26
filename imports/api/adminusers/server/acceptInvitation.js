// Time-stamp: 2017-08-13
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : acceptInvitation.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Meteor } from "meteor/meteor";
import { AdminInvitations } from "../invitations.js";
import { Agencies } from "../../agencies/agencies.js";
import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/meteor-roles";
import { addAgency } from "../../agencies/server/addAgency.js";
import { Plans } from "../../plans/plans.js";
import { Modules } from "../../modules/modules.js";

let getInvite = (token) => {
  return AdminInvitations.findOne({ token });
};

let createUser = (options) => {
  try {
    var userId = Accounts.createUser({
      email: options.email,
      password: options.password,
      profile: {
        name: options.username,
        contact: options.contactNumber,
      },
    });
    Accounts.setUsername(userId, options.username);
    return userId;
  } catch (e) {
    var user = Accounts.findUserByEmail(options.email);
    return user._id;
  }
};

let addUserToRole = (userId, role, group) => {
  Roles.addUsersToRoles(userId, role, group);
};

let removeInvite = (invite) => {
  AdminInvitations.remove(invite._id);
};

let addEventsToUser = (userId, eventsList) => {
  Meteor.users.update(userId, {
    $set: {
      allowedEvents: eventsList,
    },
  });
};

let acceptInvite = (options) => {
  let invite = getInvite(options.token);
  if (!invite) {
    return;
  }
  invite.password = options.password;
  var userId = createUser(invite);

  if (invite.type === "agency") {
    //ABL SAM BOC
    let aData = {};
    aData.name = invite.name;
    aData.email = invite.email;
    aData.contactName = invite.username;
    aData.contactNumber = invite.contactNumber;
    let plan = Plans.findOne({ _id: invite.assignedPlanInfo.planId });

    if (plan) {
      aData.agencyPlanNumOfAppsPurchased = invite.assignedPlanInfo.appCount;
      aData.agencyPlanId = plan._id;
      aData.agencyPlanName = plan.planName;
      aData.agencyPlanDescription = plan.planDescription;
      aData.agencyPlanFeatureList = plan.planFeatures;
      aData.agencyPlanAppsGenerated = 0;
      aData.agencyPlanFeatureName = plan.planName;
      aData.agencyModule = plan.planName;
      aData.agencyModule = [];
      aData.planPurchaseDateTime = invite.date;
      if (
        typeof invite.assignedModuleInfo != "undefined" &&
        invite.assignedModuleInfo.length
      ) {
        invite.assignedModuleInfo.forEach((element) => {
          let module = Modules.findOne({ _id: element });
          if (module) {
            let moduleData = {};
            moduleData.agencyModuleId = module._id;
            moduleData.agencyModuleName = module.moduleName;
            moduleData.agencyModuleNumOfModulesPurchased = 1;
            moduleData.agencyModuleNumOfModulesUsed = 0;
            moduleData.moduleCostPerModule = module.moduleCostPerModule;
            moduleData.moduleGstRate = module.moduleGstRate;
            aData.agencyModule.push(moduleData);
          }
        });
      }
    }
    //ABL SAM EOC

    var agencyId = addAgency(aData);
    addUserToRole(userId, "admin", agencyId);
  } else if (invite.type === "admin-user") {
    addUserToRole(userId, invite.role, invite.agency);
    if (invite.selectedEvents && invite.selectedEvents.length > 0) {
      addEventsToUser(userId, invite.selectedEvents);
    }
  }

  removeInvite(invite);
};

export const AcceptInvite = acceptInvite;
