import SimpleSchema from 'simpl-schema';

export const PackagesSchema = new SimpleSchema({
  packageId: {
    type: String,
    optional: true
  },
  packagesName: String,
  packagesDescription: String,
  packagesCostPerApp: String,
  packagesMinApp: String,
  packagesMaxApp: String,
});
