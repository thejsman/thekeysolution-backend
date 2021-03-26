import { Meteor } from 'meteor/meteor';

export const onlinePayment = (extraInfo) => {
     var temp=mojo.createRequest(extraInfo);
     return temp;
};
export const PaymentDetails = (payment) => {
	console.log('Details')
     var temp = mojo.getPaymentDetails(payment.payment_request_id, payment.payment_id);
  return temp;
};