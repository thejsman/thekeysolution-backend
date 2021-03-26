import "./imageUpload.html";
import "./imageUpload.scss";

import SimpleSchema from "simpl-schema";
import { ReactiveDict } from "meteor/reactive-dict";

Template.imageUpload.onCreated(function() {
  const data = Template.currentData();
  this.state = new ReactiveDict();
  this.state.setDefault({
    imageName: data.imageName || "impageInput",
    defaultImage: data.defaultImage || "",
    maxFileSize: data.maxFileSize || "2M",
    imageFormat: data.imageFormat || "portrait square landscape",
    imageExtension: data.imageExtension || "png jpg jpeg"
  });

  this.autorun(() => {
    new SimpleSchema({
      // Unique ID for dropify container
      dropifyId: {
        type: String,
        optional: true
      },

      // Title for Image/Field
      labelTitle: String,

      // Instruction or description for image
      labelText: String,

      // default image url (if any)
      defaultImage: {
        type: String,
        optional: true
      },

      // input field name for image
      imageName: String,

      // Max file allowed to upload
      maxFileSize: {
        type: String,
        optional: true
      },

      // Image format square, rectangle etc. (separe with space if multiple)
      imageFormat: {
        type: String,
        optional: true
      },

      // Image formats png, jpg etc. (separe with space if multiple)
      imageExtension: {
        type: String,
        optional: true
      }
    }).validate(Template.currentData());

    // Set default image if available
  });
});

Template.imageUpload.helpers({
  image: () => {
    const image = Template.instance().state.get("defaultImage");
    return image;
  }
});

Template.imageUpload.onRendered(function() {
  this.autorun(() => {
    this.imageName = Template.instance().state.get("imageName");
    this.dropifyInput = $(`input[name=${this.imageName}]`);
    this.dropifyInput.dropify();
  });
});
