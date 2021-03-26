import { UploadFiles } from "../../../../api/upload/S3Uploads";
import {
  showError,
  showSuccess
} from "../../../components/notifs/notifications";

class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }
  upload() {
    return this.loader.file.then(
      file =>
        new Promise((resolve, reject) => {
          this._sendRequest(resolve, reject, file);
        })
    );
  }
  abort() {}

  _sendRequest(resolve, reject, file) {
    UploadFiles([file], 1, true)
      .then(res => {
        resolve({ default: res[file.name] });
      })
      .catch(err => {
        showError(err);
        reject();
      });
  }
}

export default function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = loader => {
    return new MyUploadAdapter(loader);
  };
}
