import { Bert } from 'meteor/themeteorchef:bert';
Bert.defaults.hideDelay = 5000;

export const showError = (err) => {
  Bert.alert({
    title: 'Error',
    message: err.toString(),
    type: 'danger',
    icon: 'fa-remove',
    style: 'fixed-bottom'
  });
  // Materialize.toast(err.toString(), 000, 'red');
};

export const showSuccess = (res) => {
  Bert.alert({
    title: 'Success',
    message: res.toString(),
    type: 'success',
    icon: 'fa-check',
    style: 'fixed-bottom'
  });
  // Materialize.toast(res.toString(), 1000, 'green');
};
// ABL : BOC TO show Warning type Notifications
export const showWarning = (res) => {
  Bert.alert({
    title: 'Warning',
    message: res.toString(),
    type: 'warning',
    icon: 'fa-warning',
    style: 'fixed-bottom'
  });
  // Materialize.toast(res.toString(), 1000, 'green');
};
export const showResult = (err, res) => {
  if(err) {
    showError(err);
  }
  else {
    showSuccess(res);
  }
};
