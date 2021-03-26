import { Meteor } from 'meteor/meteor';
import _ from 'lodash';
import AWS from 'aws-sdk';
import { RequestStatus } from '../downloads/download';

if(Meteor.isServer) {
  AWS.config.accessKeyId = Meteor.settings.S3.key;
  AWS.config.secretAccessKey = Meteor.settings.S3.secret;
  AWS.config.region = Meteor.settings.S3.region;
}

const s3 = new AWS.S3();

export const GetSignedURL = (opts, folderName) => {
  const filename = Random.id();
    const type = opts.file_type; //video or audio (for poodll recorder schemeurl)
    const contenttype = opts.file_type;
    //const contenttype = 'application/octet-stream'; // audio content type
    const fileExtension = contenttype.split("/").pop();
    const timelimit = 100;
    const s3Params = {
      Bucket: Meteor.settings.S3.bucket,
      Key: folderName+'/'+filename+"."+fileExtension,
      ContentType: contenttype,
      Expires: 600000,
      ACL: 'public-read'
    };
    var signedurl = s3.getSignedUrl('putObject', s3Params);
    return signedurl;
};

export const StubUploadFiles = (jQ, totalCount, optional) => {
  let fileList = getFakeFileArray(jQ);
  let count = fileList.length;
  if(count < totalCount && optional !== true) {
    return null;
  }

  let result = {};
  _.each(fileList, f=> {
    result[f.key] = f.upload_name;
  });
  return result;
};

export const UploadFiles = (jQ, totalCount, optional) => {

  let fileList = getFileArray(jQ);
  console.log('File List ... ', fileList);
  let count = fileList.length;
  return new Promise((resolve, reject) => {
    let result = {};
    if(count < totalCount && optional !== true) {
      reject(`Please add all ${totalCount} files to continue`);
    }
    else if(fileList.length == 0) {
      resolve({});
    }
    else {
      console.log('File List ready to be uploaded .... ')
      // return true;
      S3.upload({
        files: fileList,
        path: 'bmtimages',
        unique_name: false
      }, (err, res) => {
        if(err) {
          reject("Upload failed");
        }
        else {
          let el = _.find(fileList, f => {
            return f.upload_name === res.file.name;
          });
          if(el) {
            result[el.key] = res.secure_url;
          }
          if(_.size(result) >= count) {
            resolve(result);
          }
        }
      });
    }
  });
};


export const fileUploadName = function fileUploadName(f, name) {
  if(!f) {
    return "";
  }
  var extension = f.type.split("/")[1];
  return name + "." + extension;
};

export const toArray = function toArray(fileList) {
    return Array.prototype.slice.call(fileList);
};

export const getFakeFileArray = (jQ) => {
  var fileList = [];
  jQ.each( (index, element) => {
    var uniqueId = Random.id();
    let files = [{
      upload_name: uniqueId,
      key: element.name
    }];
    fileList = toArray(fileList).concat(toArray(files));
  });
  return fileList;
};

export const getFileArray = (jQ) => {
  var fileList = [];
  jQ.jquery ? jQ.each( (index, element) => {
    var uniqueId = Random.id();
    if(element.files.length < 1) {
      return;
    }
    element.files[0].upload_name = fileUploadName(element.files[0], uniqueId);
    element.files[0].key = element.name;
    fileList = toArray(fileList).concat(toArray(element.files));
  }) : jQ.forEach((file) => {
    var uniqueId = Random.id();
    file.upload_name = fileUploadName(file, uniqueId);
    file.key = file.name;
    fileList = [...fileList, file];
  });
  return fileList;
};

export const uploadMultiplePDFfiles = (files) => {
  console.log('File List ... ', files);
  let count = files.length;
  return new Promise((resolve, reject) => {
    let result = {};
    if(files.length == 0) {
      resolve({});
    }else {
      S3.upload({
        files: files,
        path: 'bmtimages',
        unique_name: false
      }, (err, res) => {
        if(err) {
          count--;
          if(_.size(result) >= count) {
            resolve(result);
          }
          // reject("Upload failed");
        }
        else {
          let el = _.find(files, f => {
            return f.upload_name === res.file.name;
          });

          if(el) {
            result[el.upload_name] = res.secure_url;
          }
          if(_.size(result) >= count) {
            resolve(result);
          }
        }
      });
    }
  });
};