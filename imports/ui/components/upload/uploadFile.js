const uploadPromise = (params) => (
  new Promise((resolve, reject) => {
    S3.upload(params, (error, uploadedFile) => {
      if (error) {
        reject(error);
      }
      console.log(uploadedFile);
      resolve(uploadedFile);
    });
  })
);

export const uploadFile = (files, path, singleFile = true, encoding = false) => {
  const uploadParams = {
    files,
    path,
    unique_name: true
  };
  console.log(files);
  if (!files || !path) {
    throw new Error('no file');
  }
  if (singleFile) {
    return uploadPromise(uploadParams);
  }
  const returnedObjects = [];
  const promises = [];
  for (let i = 0; i < files.length; i++) {
    const newParams = {
      file: files[i],
      path,
      unique_name: false
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
