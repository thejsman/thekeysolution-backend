Package.describe({
  summary: "Authorization package for Meteor",
  version: "2.0.0",
  git: "git@bitbucket.org:sparklin/meteor-roles.git",
  name: "meteor-roles"
});

Package.onUse(function (api) {
  var both = ['client', 'server'];

  api.versionsFrom("METEOR@1.4.1");

  api.use(['underscore',
           'accounts-base',
           'tracker',
           'mongo',
           'check'], both);

  api.use(['blaze'], 'client', {weak: true});

  api.export('Roles');

  api.addFiles('roles/roles_common.js', both);
  api.addFiles('roles/roles_server.js', 'server');
  api.addFiles(['roles/client/debug.js',
                'roles/client/uiHelpers.js',
                'roles/client/subscriptions.js'], 'client');
});

Package.onTest(function (api) {
  api.versionsFrom("METEOR@1.4.1");

  var both = ['client', 'server'];

  // `accounts-password` is included so `Meteor.users` exists

  api.use(['meteor-roles',
           'accounts-password',
           'underscore',
           'mongo',
           'tinytest'], both);

  api.addFiles('roles/tests/client.js', 'client');
  api.addFiles('roles/tests/server.js', 'server');
});
