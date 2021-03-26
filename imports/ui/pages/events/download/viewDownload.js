import "./viewDownload.html";

import { FlowRouter } from "meteor/kadira:flow-router";
import { ReactiveDict } from "meteor/reactive-dict";

import { uploadAllFiles, notifyGuests } from "../../../../api/fileWithFolioNumber/methods";
import { getGuestByFolioNumber } from "../../../../api/guests/methods";

import { getDownload } from "../../../../api/downloads/methods";
import {
  showError,
  showSuccess
} from "../../../components/notifs/notifications";
import {
  uploadMultiplePDFfiles,
  fileUploadName
} from "../../../../api/upload/S3Uploads";

Template.viewDownload.onCreated(function() {
  const data = [];
  this.eventId = FlowRouter.getParam("id");
  this.state = new ReactiveDict();
  this.state.set("data", data);
  this.downloadId = FlowRouter.getParam("downloadId");
  this.state.set("loading", true);
  this.autorun(() => {
    getDownload.call(this.downloadId, (err, res) => {
      if (err) {
        console.log("Errors :: ", err);
        return;
      }
      res.map(res => {
        this.state.set("data", res);
        this.state.set("loading", false);
      });
    });
  });
});

Template.viewDownload.helpers({
  data: () => {
    return Template.instance().state.get("data");
  },
  sections: () => {
    const data = Template.instance().state.get("data");
    return data && data.sections;
  },
  multipleSections: () => {
    const data = Template.instance().state.get("data");
    return data && data.sections && data.sections.length > 1;
  },
  sectionName: () => {
    const data = Template.instance().state.get("data");
    return data && data.name;
  }
});

Template.viewDownload.events({
  "click .upload-files": async (event, template) => {
    event.preventDefault();
    const _self = this;

    _self.$('button').prop("disabled", true);
    _self.$(".progress").removeClass("is-hidden");

    const eventId = FlowRouter.getParam("id");
    const sectionId = FlowRouter.getParam("downloadId");
    const filesToUpload = [];
    const promises = [];
    const sendNotification = _self.$("input#sendNofication:checked").length > 0;
    const sendEmail = _self.$("input#sendEmail:checked").length > 0;
    console.log(`Send Notification : ${sendNotification} && Send Email : ${sendEmail}`)
    await _self.$("form.uploadFileForm").each(async (index, element) => {
      const formData = new FormData(element);
      const subSectionId = _self.$(element).find('.subsectionId').val();
      await formData.forEach(async file => {
        if (file.type == "application/pdf") {
          let folioNumber = file.name.substr(0, file.name.lastIndexOf("."));
          folioNumber = folioNumber.split("-")[0];

          const guest =
            folioNumber.toLowerCase() === "all" ? updateFileMeta(filesToUpload, file, subSectionId): checkFolioNumberAndUpdateFileMeta(
                  filesToUpload,
                  file,
                  folioNumber,
                  subSectionId,
                  eventId
                );
          promises.push(guest);
        }
      });
    });

    Promise.all(promises).then(res => {
      if (!filesToUpload.length) {
        _self.$(".progress").addClass("is-hidden");
        _self.$('button').prop("disabled", false);
        return;
      }
      uploadMultiplePDFfiles(filesToUpload).then(kwargs => {
        const payload = filesToUpload.map(file => {
          return {
            eventId: eventId,
            guestId: file.guest === "all" ? null : file.guest[0]._id,
            folioNumber:
              file.guest === "all" ? null : file.guest[0].folioNumber,
            url: kwargs[file.key],
            sections: sectionId,
            subSectionId: file.subSectionId,
          };
        });

        uploadAllFiles.call(payload, (err, res) => {
          _self.$("form").each((i, f) => f.reset());
          _self.$(".progress").addClass("is-hidden");
          _self.$('button').prop("disabled", false);
          if (err) {
            showError(err.message);
          } else {
            console.log('Response ::', res);
            showSuccess("Section Updated");
          }
        });
        
        // Only Send Notification and/or email only if either of them selected
        if(sendNotification || sendEmail) {
          console.log("Sending Notifications to Guest ..", payload);
          const option = [{
            notification: sendNotification, email: sendEmail
          }]

          const data = {
            data: payload,
            sendNotification,
            sendEmail
          }
          // const option = [notification= sendNotification, email= sendEmail]
          console.log("Options ::", data)
          notifyGuests.call(data, (err, res) =>{
            if(err) {
              console.error(err)
            } else {
              console.log(res)
            }
          })
        }
      });
    });
  }
});

const checkFolioNumberAndUpdateFileMeta = (
  filesToUpload,
  file,
  folioNumber,
  subSectionId,
  eventId

) => {
  return new Promise((resolve, reject) => {
    getGuestByFolioNumber.call({folioNumber,eventId}, async (err, res) => {
      if (!err && res && res.length) {
        const key = await fileUploadName(file, Random.id());
        file.upload_name = key;
        file.guest = res;
        file.key = key;
        file.subSectionId = subSectionId;
        filesToUpload.push(file);
        resolve(res);
      } else {
        reject(err);
      }
    });
  });
};

const updateFileMeta = (filesToUpload, file, subSectionId) => {
  return new Promise(async resolve => {
    const key = await fileUploadName(file, Random.id());
    file.upload_name = key;
    file.guest = "all";
    file.key = key;
    file.subSectionId = subSectionId;
    filesToUpload.push(file);
    resolve("all");
  });
};
