// Time-stamp: 2017-06-14 
// 
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : upload.js
// Original Author    : Sandeep Nambiar@
// Description        : 
// -------------------------------------------------------------------

const uploadPromise = (params) => (
  new Promise((resolve, reject) => {
    S3.upload(params, (error, uploadedFile) => {
      if (error) {
        reject(error);
      }
      resolve(uploadedFile);
    });
  })
);

export const uploadFile = (files, path, singleFile = true, encoding = false) => {
  const uploadParams = {
    files,
    path
  };
  if (!files || !path) {
    throw new Error('no file');
  }
  if (encoding) {
    uploadParams.encoding = 'base64';
  }
  if (singleFile) {
    return uploadPromise(uploadParams);
  }
  const returnedObjects = [];
  const promises = [];
  for (let i = 0; i < files.length; i++) {
    const newParams = {
      file: files[i],
      path
    };
    promises.push(
      uploadPromise(newParams)
      .then(upload => (returnedObjects.push(upload)))
    );
  }
  return Promise.all(promises)
  .then(() => returnedObjects)
  .catch(error => console.log(error));
};
