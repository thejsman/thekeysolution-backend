import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { ReactiveVar } from 'meteor/reactive-var';
import { Roles } from 'meteor/meteor-roles';
import { Agencies } from '../../../../api/agencies/agencies.js';
import { AdminInvitations } from '../../../../api/adminusers/invitations.js';
import { addAdminUserInvitation, cancelAdminUserInvitation, changeAdminRole, resendAdminUserInvitation, deleteAdminUser, updateAdminEvents } from '../../../../api/adminusers/methods.js';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { Events } from '../../../../api/events/events.js';
import './admin_control_users.html';
import './admin_control_users.scss';

var roles = ['superadmin', 'admin', 'client', 'freelancer', 'member'];

let currentCancellationId = new ReactiveVar();
let cancelModal = new ReactiveVar();
let currentEditFreelancerId = new ReactiveVar();

Template.control_user_list.onRendered(function () {
  currentEditFreelancerId.set(null);
  var sub = this.subscribe('admin.user.joined');
  var self = this;
  this.autorun(() => {
    if (sub.ready()) {
      Meteor.setTimeout(() => {
        self.$('select').material_select('destroy');
        self.$('select').material_select();
      }, 100);
    }
  });

  this.$('.modal').modal();
});

Template.edit_freelancer_button.helpers({
  eventsList() {
    let current = currentEditFreelancerId.get();
    if (current) {
      let user = Meteor.users.findOne(current);
      if (user) {
        let evs = Events.find().map(e => {
          console.log(user.allowedEvents, e._id);
          if (user.allowedEvents && user.allowedEvents.indexOf(e._id) > -1) {

            return {
              ...e,
              isAllowed: true
            };
          }
          return e;
        });
        return evs;
      }
    }
    return [];
  }
});

Template.edit_freelancer_button.events({
  'submit #edit-events-freelancer'(event, template) {
    event.preventDefault();
    let d = template.$('input[type=checkbox]').map(function () {
      return {
        id: this.id,
        allow: this.checked
      };
    }).get();
    let data = {
      selectedEvents: d,
      userId: currentEditFreelancerId.get()
    };
    updateAdminEvents.call(data, (err, res) => {
      if (err) showError(err);
      else {
        showSuccess("Updated events");
        currentEditFreelancerId.set(null);
        template.$('.modal').modal('close');
      }
    });
  }
});

Template.control_user_list_item.events({
  'click .click_delete-user-button'(event, template) {
    let userId = template.data.user._id;

    let agencies = Agencies.find().fetch();
    agencies = agencies.map(a => a._id);
    mbox.confirm("Are you sure?", (yes) => {
      if (!yes) return;
      deleteAdminUser.call({ userId, agencies }, (err, res) => {
        if (err) showError(err);
        else showSuccess("Removed user");
      });
    });
  },

  'click .click_edit-user-button'(event, template) {
    currentEditFreelancerId.set(template.data.user._id);
  },

  'change .change_role_selection'(event, template) {
    var id = template.data.user._id;
    var role = template.$(event.target).val();
    var agency = Roles.getScopesForUser(id)[0];
    // var agency = Roles.getScopesForUser(id)[0];
    changeAdminRole.call({ id, role, agency }, (err, res) => {
      if (err) {
        showError(err.toString());
      }
      else {
        showSuccess("Changed role");
        Meteor.setTimeout(() => {
          $('select').material_select('destroy');
          $('select').material_select();
        }, 100);
      }
    });
    // changeAdminRole({ id: id, role: })
  }
});

Template.control_user_list_item.helpers({
  getAgency(id) {
    var scopes = Roles.getScopesForUser(id);
    if (scopes.length > 0) {
      let agencyNames = [];
      scopes.forEach(s => {
        let agency = Agencies.findOne(s);
        if (agency) {
          agencyNames.push(agency.name);
        }
      });
      return agencyNames.join();
    }
    return "";
  },

  getEmails(emails) {
    return emails ? emails[0].address : "";
  },

  isClientOrFreelancer() {
    let scopes = Roles.getScopesForUser(this.user._id);
    if (scopes.length > 0) {
      for (var i = 0; i < scopes.length; i++) {
        if (Roles.userIsInRole(this.user._id, 'freelancer', scopes[i]) || Roles.userIsInRole(this.user._id, 'client', scopes[i])) {
          return true;
        }
      }
      return false;
    }
    return Roles.userIsInRole(this.user._id, 'client') || Roles.userIsInRole(this.user._id, 'freelancer');
  },

  isNotSelf() {
    return this.user._id !== Meteor.userId();
  },

  currentUser() {
    return this.user._id === Meteor.userId();
  },
  checkDeletePermission() {

    let scopes = Roles.getScopesForUser(Meteor.userId());
    if (scopes.length > 0) {
      for (var i = 0; i < scopes.length; i++) {
        if (Roles.userIsInRole(Meteor.userId(), 'member', scopes[i]) && Roles.userIsInRole(this.user._id, 'admin', scopes[i])) {
          console.log('Not Permitted!');
          return false;
        }
      }
      return true;
    }

    return true;

  },
  checkChangeRolePermission() {
    let scopes = Roles.getScopesForUser(Meteor.userId());
    if (scopes.length > 0) {
      for (var i = 0; i < scopes.length; i++) {
        if (Roles.userIsInRole(Meteor.userId(), 'member', scopes[i]) || Roles.userIsInRole(this.user._id, 'freelancer', scopes[i])) {

          return false;
        }
      }

      return true;
    }

    return (Roles.userIsInRole(userId, 'superadmin') || Roles.userIsInRole(userId, 'admin'));

  },
  getRole() {
    if (!this.user.roles) {
      return "";
    }
    return getRole(this.user.roles);
  },

  isSelected(val) {
    return val === getRole(this.user.roles) ? "selected" : "";
  }
});

Template.control_user_list.helpers({

  userList() {

    var agencies = Roles.getScopesForUser(Meteor.userId());
    if (agencies.length < 1) {
      let search = {
        "roles._id": {
          $in: ['admin', 'freelancer', 'client', 'member']
        }
      };
      let agency = FlowRouter.getQueryParam("agency");
      if (agency) {
        search = {
          ...search,
          "roles.scope": agency
        }
      }
      return Meteor.users.find(search);
    }
    else {
      return Meteor.users.find({
        "roles.scope": {
          $in: agencies
        },
        "roles._id": {
          $in: ['admin', 'client', 'freelancer', 'member']
        }
      }, {
          sort: {
            createdAt: -1
          }
        });
    }
  }
});

function getRole(userRoles) {
  var finalRole = "";
  for (var i = 0; i < userRoles.length; i++) {
    let role = userRoles[i];
    if (roles.findIndex(el => el == role._id) > -1) {
      finalRole = role._id;
      break;
    }
  }
  return finalRole;
}


Template.invited_user_list.onRendered(function () {
  this.subscribe('admin.user.invitations');
});

Template.invited_user_list.helpers({
  invitedUsers() {
    let search = {};
    let agency = FlowRouter.getQueryParam("agency");
    if (agency) {
      search = {
        ...search,
        agency: agency
      };
    }
    return AdminInvitations.find(search);
  },

  hasInvitations() {
    return AdminInvitations.find().count() > 0;
  }
});

Template.invited_user_item.events({
  'click .click_cancel-invitation-button'(event, template) {
    currentCancellationId.set(template.data.info._id);
    cancelModal.get().modal('open');
  },
  'click .click_resend-invitation-button'(event, template) {
    event.preventDefault();
    resendAdminUserInvitation.call(this.info, (err, res) => {
      if (err) {
        showError(err.toString());
      }
      else {
        showSuccess("Invitation Resent");
      }
    });
  }
});

Template.invited_user_item.helpers({
  getAgencyName() {
    let agency = Agencies.findOne(this.info.agency);
    return agency ? agency.name : "";
  },
  invitedAgencyList() {
    let agencyname = AdminInvitations.findOne({ _id: this.info._id });
    return agencyname.name;
  },
});


Template.invite_user_button.onRendered(function () {
  var self = this;
  var agencySelect = this.$('select');
  this.autorun(() => {
    self.subscribe('admin.agency.list', Meteor.userId());
    var agencies = Agencies.findOne();
    // need to recreate this fucker
    // AND need to offset it with fetch
    // stupid library
    if (agencies) {
      this.$('#agency-name').val(agencies._id);
    }
    Meteor.setTimeout(() => {
      agencySelect.material_select('destroy');
      agencySelect.material_select();
      Materialize.updateTextFields();
    }, 100);
  });
  this.$('.modal').modal();
});

let showEvents = new ReactiveVar(false);
let showEventsFor = ['client', 'freelancer'];

Template.invite_user_button.onRendered(function () {
  showEvents.set(false);
  this.subscribe('events.all');
});
Template.invite_user_button.helpers({
  agencyName() {

    return Agencies.find().map(agency => {
      return {
        name: agency.name,
        id: agency._id
      };
    });
  },

  showEvents() {
    return showEvents.get();
  },

  eventsList() {
    return Events.find();
  },

  isDisabled() {
    var isSuper = Roles.userIsInRole(Meteor.userId(), 'superadmin');
    return !isSuper ? "disabled" : "";
  }
});

Template.invite_user_button.events({
  'change #user-role-select'(event, template) {
    showEvents.set(showEventsFor.indexOf(event.target.value) > -1);
  },

  'submit #invite-user'(event, template) {
    event.preventDefault();
    var data = template.$(event.target).serializeObject();
    if (!data.agency) {
      let agency = Agencies.findOne();
      if (agency) {
        data.agency = agency._id;
      }
    }
    console.log("INVITE DATA ::::: ",data);
    addAdminUserInvitation.call(data, (err, res) => {
      if (err) {
        showError(err);
      }
      else {
        showSuccess("Invitation sent!");
        template.$(event.target)[0].reset();
      }
    });
    template.$('.modal').modal('close');
  }
});

Template.cancel_user_invitation_button.onRendered(function () {
  var modal = this.$('.modal');
  modal.modal();
  cancelModal.set(modal);
});

Template.cancel_user_invitation_button.events({
  'click .click_cancel-button'(event, template) {
    cancelModal.get().modal('close');
    var invitation = AdminInvitations.findOne(currentCancellationId.get());
    cancelAdminUserInvitation.call({
      id: invitation._id,
      agency: invitation.agency
    }, (err, res) => {
      if (err) {
        showError(err);
      }
      else {
        showSuccess("Invitation revoked");
      }
    });
  }
});
