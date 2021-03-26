
// Time-stamp: 2017-08-27
//
// -------------------------------------------------------------------
// Project            : /home/nambiar/Projects/Sparklin/bmt/admin_bmt/
// File Name          : events_hotels_add.js
// Original Author    : Sandeep Nambiar@
// Description        :
// -------------------------------------------------------------------

import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { showError, showSuccess } from '../../../components/notifs/notifications.js';
import { insertHotelforsale, updateHotelforsale } from '../../../../api/hotelsforsale/methods.js';
import { FlowRouter } from 'meteor/kadira:flow-router';
import _ from 'lodash';
import '../../../components/datetimepicker/datetimepicker.js';
import './events_hotelsforsale_add_room.js';
import './events_hotelsforsale_add.html';
import chance from '../../../../extras/randomizer.js';
import '../../../components/preloader/preloaders.js';
import { uploadFile } from '../../../components/upload/uploadFile.js';
let hotelRooms = new ReactiveVar([]);

Template.events_hotelsforsale_add.onRendered(function() {
  hotelRooms.set([]);
  Meteor.setTimeout(()=>{
    Materialize.updateTextFields();
  }, 100);
  this.$('input#hotel_name').characterCounter();
  if(this.hotelInfo){
    $('#hotel_rating option[value="'+this.hotelInfo.hotelRating+'"]').attr('selected','selected');
  }

  let hotelImageMsg = {
    messages: {
      'default': 'Hotel Image <br>Size: 100px X 100px <br>Format: PNG or JPG Only',
      'replace': 'Drag and drop or click to replace <br>Size: 100px X 100px <br>Format: PNG or JPG Only',
      'remove':  'Remove Hotel Image',
      'error':   'Ooops, something wrong happended.'
    },
    maxHeight: 101,
    maxWidth: 101,
    allowedFileExtensions: "png jpg jpeg"
  };
  this.initialized = false;
  if(this.hotelInfo) {
    console.log(1111111111);
    this.autorun(() => {
      if(this.initialized) return;
      let p = this.hotelInfo;

      if(p && p.hotelImageUrl) {
	    hotelImageMsg.defaultFile = p.hotelImageUrl;
	    this.$('.file-hotelImage').dropify(hotelImageMsg);

	  this.initialized = true;
	}
	else {
	  this.$('.file-hotelImage').dropify(hotelImageMsg);
	  this.initialized = true;
	}

    });

  }
  else {
    this.$('.file-hotelImage').dropify(hotelImageMsg);
    this.initialized = true;
  }



});

Template.events_hotelsforsale_add.helpers({
  title() {
    return this.hotelInfo ? "Edit Hotel" : "Add Hotel";
  },
selectRating:function(param){
  if(this.hotelInfo.hotelRating==param){
    return 'selected';
  }else{
    return "";
  }
},
  buttonText() {
    return this.hotelInfo ? "Update Hotel" : "Add Hotel";
  },

  info() {
    if (this.hotelInfo) return this.hotelInfo;
    if(Meteor.settings.public.autoFillForm)
      return {
	hotelName: chance.name(),
	hotelContactName : chance.name(),
	hotelContactDesignation : chance.word(),
	hotelContactPhone : chance.phone(),
	hotelType: chance.word(),
	hotelAddress1: chance.address(),
	hotelAddress2: chance.address(),
	hotelAddressCity: chance.city(),
	hotelAddressState: chance.state(),
	hotelAddressPincode: chance.zip(),
	hotelAddressLandmark: chance.word()
      };
    return {};
  }

});
// CODE FOR FILE UPLOAD
function fileUploadName(f, name) {
  if(!f) {
    return "";
  }
  var extension = f.type.split("/")[1];
  return name + "." + extension;
}
function toArray(fileList) {
  return Array.prototype.slice.call(fileList);
}
Template.events_hotelsforsale_add.events({
  'submit #add-hotel-for-sale-form'(event, template) {
    event.preventDefault();
    let data = template.$(event.target).serializeObject();
    data.eventId = FlowRouter.getParam("id");
    let editing = !!template.data.hotelInfo;
    let successText = editing ? "Hotel Updated" : "Hotel Added";
    let cb = (err, res) => {
      if(err) {
	showError(err);
      }
      else {
        template.$('.modal').modal('close');
        showSuccess(successText);
	if(!editing)
          FlowRouter.go('events.hotelforsale', { id: FlowRouter.getParam("id")});
      }
    };
// CODE FOR FILE UPLOAD
    var fileInputs = template.$('input[type="file"]');
    var fileList = [];
    fileInputs.each( (index, element) => {
      var uniqueId = Random.id();
      if(element.files.length > 0) {
        element.files[0].upload_name = fileUploadName(element.files[0], uniqueId);
        fileList = toArray(fileList).concat(toArray(element.files));

      }

    });
    if(fileList.length > 0) {
      S3.upload({
  files: fileList,
  path: 'bmtimages',
  unique_name: false
      }, (err, res) => {
  if(err) {
    showError("Uploading Images failed");
  }
  else {

    data.hotelImageUrl=res.url;

        if(editing) {
          data.hotelId = template.data.hotelInfo._id;
          updateHotelforsale.call(data, cb);
        }
        else {
          insertHotelforsale.call(data, cb);
        }

  }
      });
    }else{

          if(editing) {
            data.hotelId = template.data.hotelInfo._id;
            updateHotelforsale.call(data, cb);
          }
          else {
            insertHotelforsale.call(data, cb);
          }

    }
  }
});
