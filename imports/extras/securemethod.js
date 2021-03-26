// Time-stamp: 2017-08-13 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : securemethod.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------

import { ValidatedMethod } from 'meteor/mdg:validated-method';
// import { PermissionsMixin } from 'meteor/didericis:permissions-mixin';

export class SecuredMethod extends ValidatedMethod { 
    constructor(methodDefinition) {
        // if (Array.isArray(methodDefinition.mixins)) {
        //     methodDefinition.mixins = methodDefinition.mixins.concat(PermissionsMixin);
        // } else {
        //     methodDefinition.mixins = [PermissionsMixin];
        // }
      super(methodDefinition);
    }
};
