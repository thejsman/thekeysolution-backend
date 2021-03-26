import { Guests } from '../guests/guests'
import { insertGuest } from '../guests/methods'

if (Meteor.isServer) {
  // Global API configuration
  var Api = new Restivus({
    version: 'v1',
    useDefaultAuth: false,
    prettyJson: true
  });

  // Generates: GET, POST on /api/items and GET, PUT, PATCH, DELETE on
  // /api/items/:id for the Items collection
  Api.addCollection(Guests);

  // Generates: POST on /api/users and GET, DELETE /api/users/:id for
  // Meteor.users collection
  Api.addCollection(Meteor.users, {
    excludedEndpoints: [ 'put','delete','patch'],
    routeOptions: {
      authRequired: false
    },
    endpoints: {
      post: {
        authRequired: false
      }
    }
  });

  // ADD GUEST
  Api.addRoute('guest/new', {authRequired: false}, {
    post: {
      action: function () {
        console.log('REST API REQ :: ', this.queryParams);
        const payload = {
          eventId: this.queryParams.eventId,
          guestFirstName: this.queryParams.fname,
          guestLastName: this.queryParams.lname,
          guestFamilyID: 'API-' + this.queryParams.fname.substr(0,1)+this.queryParams.lname.substr(0,1)+'-'+(Math.floor((Math.random() * 10000) + 1)),
          guestPersonalEmail: this.queryParams.email,
          guestTitle : this.queryParams.title,
          guestPhoneCode: this.queryParams.countryCode,
          guestContactNo : this.queryParams.phone,
          guestGender: this.queryParams.gender,
          guestRemarks: this.queryParams.remark
        };
        // let data = this.bodyParams
        insertGuest.call(payload, (err, res) => {
          if (err) {
            return {
                statusCode: 401,
                body: {status: 'error', message: 'Unauthorized'}
            };
        } else {
            return {
                statusCode: 200,
                body: {status: 'success', message: 'Ok'}
            };
        }
        })
      }
    }
  });
}