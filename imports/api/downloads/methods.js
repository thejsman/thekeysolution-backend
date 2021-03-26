import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { DownloadSectionSchema } from "./schema";
import { Downloads, RequestStatus } from "./download";
import { Events } from "../events/events";
import { Guests } from "../guests/guests";
import _ from "lodash";

export const insertDownloadSection = new ValidatedMethod({
  name: "event.insertDownloadSection",
  validate: null,
  run: (data) => {
    const { eventId } = data;
    const event = Events.findOne({ _id: eventId });
    if (!event) {
      throw new Error('Event not found.');
    }
    Downloads.insert(data);
  }
});

export const updateDownloadSection = new ValidatedMethod({
  name: "updateDownloadSection",
  validate: null,
  run: (data) => {
    const { eventId, downloadId } = data;
    const event = Events.find({ eventId });
    if (!event) {
      throw new Error('Event not found.');
    }
    Downloads.update(downloadId, { $set: data });
  }
});

export const deleteDownloadSection = new ValidatedMethod({
  name: "deleteDownloadSection",
  validate: null,
  run: (downloadId) => {
    const download = Downloads.find({ downloadId });
    if (!download) {
      throw new Error('Event not found.');
    }

    Downloads.remove(downloadId);
  }
});

export const fetchDownloads = new ValidatedMethod({
  name: "fetchDownloads",
  validate: null,
  run: (eventId) => {
    const downloads = Downloads.find({ eventId }).fetch();

    if (downloads.length < 1) {
      return ''
    }
    return downloads;
  }
});

export const getDownload = new ValidatedMethod({
  name: "getDownload",
  validate: null,
  run: (downloadId) => {
    return Downloads.find({ _id: downloadId }).fetch();
  }
});

export const requestDownload = new ValidatedMethod({
  name: "requestDownload",

  //Madan
  // I have commented the validate schema as it was causing issues, please check this a fix it.

  // validate: DownloadSectionSchema.validator({ clean: true }),
  validate: null,
  run: async ({ eventId, guestIds, docs }) => {
    const event = await Events.find({ _id: eventId })
    const downloadPassport = _.includes(docs, 'passport')
    const downloadVisa = _.includes(docs, 'visa')
    const downloadProfile = _.includes(docs, 'profile')
    const downloadTravel = _.includes(docs, 'travel')
    const downloadInsurance = _.includes(docs, 'insurance')
    const files = []

    if (!event) {
      throw new Error('Event Not Found')
    }

    guestIds.map(id => {
      const guest = Guests.findOne({ _id: id })
      const name = `${guest.folioNumber}-${guest.guestFirstName}-${guest.guestLastName}`

      if (!guest) {
        console.error(`Guest not found for ${id} in eventId is ${eventId}`);
        return;
      }

      const data = [{
        passport: downloadPassport ? guest.guestPassportImages : null,
        visa: downloadVisa ? guest.guestVisaImages : null,
        profile: downloadProfile ? (guest.photoID ? guest.photoID.split(',') : null) : null,
        arrivalTicket: downloadTravel ? guest.TicketsArrival : null,
        departureTicket: downloadTravel ? guest.TicketsDeparture : null,
        insurance: downloadInsurance ? guest.guestInsuranceImages : null
      }]

      //Function to check if the guest folder will be empty
      const checkEmptyFolder = () => {
        const passport = downloadPassport ? ((guest.guestPassportImages) ? (guest.guestPassportImages.length !== 0 ? true : false) : false) : false;
        const visa = downloadVisa ? ((guest.guestVisaImages) ? (guest.guestVisaImages.length !== 0 ? true : false) : false) : false;
        const aTravel = downloadTravel ? ((guest.TicketsArrival) ? (guest.TicketsArrival.length !== 0 ? true : false) : false) : false;
        const dTravel = downloadTravel ? ((guest.TicketsDeparture) ? (guest.TicketsDeparture.length !== 0 ? true : false) : false) : false;
        const insurance = downloadInsurance ? ((guest.guestInsuranceImages) ? (guest.guestInsuranceImages.length !== 0 ? true : false) : false) : false;
        const profile = downloadProfile ? (guest.photoID ? true : false) : false;
        return (passport || visa || aTravel || dTravel || insurance || profile);
      }
      
      // Check if the folder is empty?
      if (checkEmptyFolder()) {
        files.push({
          name: name,
          files: data
        })
      }

    })

    const count = files.length;

    const response = await RequestStatus.insert({
      requestedBy: Meteor.userId(),
      requestedAt: Date.now(),
      status: 'pending',
      fileCount: count
    })

    return { files, response }
  }
});

export const downloadRequest = new ValidatedMethod({
  name: "downloadRequest",
  validate: null,
  run: async (data) => {
    const { id, url } = data;
    const request = await RequestStatus.find({ _id: id });

    if (!Meteor.userId()) {
      throw new Error('You must be loggedin for this.')
    }
    if (!request) {
      throw new Error('Request Not Found.')
    }

    if (Meteor.isServer) {
      const options = {
        name: Meteor.user().profile.name,
        email: Meteor.user().emails[0].address,
        url: url
      }
      require('./server/sendEmail.js').sendDownloadUrl(options)
    }
    const response = await RequestStatus.update(id, {
      $set: {
        status: 'ready',
        url: url
      }
    })

    return url
  }
})

/**
 * Upload Guest download zip to S3
 * @param {*} blob 
 */

export const uploadZip = async ({ blob, id }) => {
  const time = Date.now();
  const file = new File([blob], `guest-download-${time}.zip`, { type: 'application/zip' });
  const request = await RequestStatus.find({ _id: id });

  if (!request) {
    throw new Error('Request not found');
  }

  const url = await getURL(file).then(url => url);

  downloadRequest.call({ id, url }, (err, res) => {
    if (err) {
      throw new Error('Error while updating downloadRequest.')
    }
    return res;
  })
};

export const getURL = (file) => {
  return new Promise((resolve, reject) => {
    let result;
    if (!file) {
      reject('Zip not creation failed');
    } else {
      S3.upload({
        file: file,
        path: 'bmtimages',
        unique_name: false
      }, (err, res) => {
        if (err) {
          reject("Upload failed");
        }
        let el = file.name === res.file.name;
        if (!el) {
          reject("Error while uploading");
        }
        result = res.secure_url;
        resolve(result);
      });
    }
  });
}

export const uploadZip2 = new ValidatedMethod({
  name: 'uploadZip2',
  validate: null,
  run: ({ blob, id }) => {
    const time = Date.now();
    const file = new File([blob], `guest-download-${time}.zip`, { type: 'application/zip' });
    const request = RequestStatus.find({ _id: id });
    let result;
    const user = Meteor.users.findOne(Meteor.userId());

    let options = {
      name: user && user.profile && user.profile.name,
      email: user && user.emails && user.emails[0].address
    }
    if (!request) {
      throw new Error('Request not found');
    }

    // Upload to S3
    const url = getURL(file).then(url => url);
    // const url = S3.upload({
    //   files: blob,
    //   path: 'bmtimages',
    //   unique_name: false
    // }, (err, res) => {
    //   if(err) {
    //     console.log("Upload failed");
    //   }
    //   let el = file.name === res.file.name;
    //   if(!el) {
    //     console.log("Error while uploading");
    //   }
    //   return res.secure_url;
    // });

    console.log('res ', url)
    return url
  }
})