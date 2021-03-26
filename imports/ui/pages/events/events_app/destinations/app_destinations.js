import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { Events } from '../../../../../api/events/events.js';
import { showError, showSuccess } from '../../../../components/notifs/notifications.js';
import { StubUploadFiles, UploadFiles } from '../../../../../api/upload/S3Uploads.js';
import { insertAppDestination, deleteAppDestination, updateAppDestination } from '../../../../../api/app_general/methods.js';
import { App_General } from '../../../../../api/app_general/app_general.js';
import { AppDestinationSchema } from '../../../../../api/app_general/schema.js';
import _ from 'lodash';
import { activityRecordInsert } from '../../../../../api/activity_record/methods';

import './app_destinations.html';
import './app_destination_add.html';

let editing = new ReactiveVar(false);
let editingId = new ReactiveVar('');
let showPages = new ReactiveVar([]);
let pagesToNumbers = ['', '', 'otherDetails', 'destinationTips', 'placesToVisit'];
let dropifyShow = new ReactiveVar(false);
Template.app_destination_settings.onRendered(function () {
  editing.set(false);
  dropifyShow.set(false);
});

Template.app_destination_settings.helpers({
  destinationList() {
    let app = App_General.findOne();
    if (app && app.destinationDetails) {
      return app.destinationDetails;
    }
    else {
      return [];
    }
  },
  dontIndex(index) {
    return index + 4;
  },
  isEditing() {
    return editing.get();
  },
  editId() {
    return editingId.get();
  },
  addDestinationRoute() {
    return FlowRouter.path('events.app.destination.add', { id: FlowRouter.getParam("id") });
  },
});

Template.app_destination_settings.events({
  'click #add-destination-button'(event, template) {
    editing.set(false);
    // Meteor.setTimeout(() => {
    //   template.$('.modal').modal('open');
    // }, 100);
  },

  'click li.tab'(event, template) {
    Meteor.setTimeout(function () {
      $('#updateAppPreviewPlaces').click();
      $('#destination_dos_preview').click();
      $('#destination_travel_preview').click();
      updateAppPreviewPlaces();
      updateOverview();
      updateTravel();
      updateDos();
      var control_element = $('.owl-carausal div.owl-controls');
      if (typeof control_element != 'undefined') {
        $('.owl-carausal').prepend(control_element.wrap('</p>').parent().html());
        control_element.hide();
      }
    }, 500);
  }
});

Template.app_add_destination_settings.onRendered(function () {
  this.autorun(() => {
    Meteor.setTimeout(() => {
      Materialize.updateTextFields();
      this.$('.dropify').dropify();
      this.$('.tooltip-icon').tooltip({ delay: 50 });
      this.$('.tooltipped').tooltip({ delay: 50 });
    }, 10)
  });
  this.autorun(() => {
    let event = Events.findOne();
    if (event) {
      Meteor.setTimeout(() => {
        this.$('#destination-location').material_select();
      }, 10);
    }
  });
  let sh = [];
  if (editing.get()) {
    this.autorun(() => {
      let shp = []
      let app = App_General.findOne();
      let edId = editingId.get();
      let destination = _.find(app.destinationDetails, d => {
        return d._id === edId;
      });
      for (var i = 0; i < 5; i++) {
        let key = pagesToNumbers[i];
        shp.push(destination && !!destination[key]);
      }
      showPages.set(shp);
      Meteor.setTimeout(() => {
        this.$('#destination-location').val(destination.basicInfo.destinationName);
      }, 100);
    });
  }
  else {
    showPages.set(sh);
  }
});

Template.app_add_destination_settings.helpers({
  destinationList() {
    let event = Events.findOne();
    return event ? event.basicDetails.eventDestination : [];
  },
  usePage(pageNo) {
    return showPages.get()[pageNo] === true;
  },

  dropifyShow() {
    return dropifyShow.get();
  },
  dontIndex(index) {
    return index + 5;
  },
  title() {
    return editing.get() ? "Edit Destination" : "Add Destination";
  },
  getImage(details, index) {
    return details['placesToVisitImage' + index];
  },
  destinationDetails() {
    let ed = editing.get();
    let ret = {
      basicInfo: {},
      otherDetails: {
        destinationCurrency: Array(3).fill({})
      },
      destinationTips: {
        destinationDos: Array(4).fill(''),
        destinationDonts: Array(4).fill('')
      },
      placesToVisit: {
        destinationPlacesToVisit: Array(3).fill({})
      }
    };
    if (ed) {
      let edId = editingId.get();
      let app = App_General.findOne();
      if (app) {
        let destination = _.find(app.destinationDetails, d => { return d._id === edId; });
        if (!destination.otherDetails) {
          destination.otherDetails = {
            destinationCurrency: Array(3).fill({})
          };
        }
        else {
          let currencyDetails = destination.otherDetails.destinationCurrency;
          while (currencyDetails.length < 3) {
            currencyDetails.push({});
          }
          destination.otherDetails.destinationCurrency = currencyDetails;
        }
        if (!destination.destinationTips) {
          destination.destinationTips = {
            destinationDos: Array(4).fill(''),
            destinationDonts: Array(4).fill('')
          };
        }
        else {
          let dos = destination.destinationTips.destinationDos;
          while (dos.length < 4) {
            dos.push('');
          }
          destination.destinationTips.destinationDos = dos;
          let donts = destination.destinationTips.destinationDonts;
          while (donts.length < 4) {
            donts.push('');
          }
          destination.destinationTips.destinationDonts = donts;
        }
        if (!destination.placesToVisit) {
          destination.placesToVisit = {
            destinationPlacesToVisit: Array(3).fill({})
          };
        }
        else {
          let places = destination.placesToVisit.destinationPlacesToVisit;
          while (places.length < 3) {
            places.push({});
          }
          destination.placesToVisit.destinationPlacesToVisit = places;
        }
        ret = destination;
      }
    }
    let instance = Template.instance();
    Meteor.setTimeout(() => {
      instance.$('.dropify').dropify()
      Materialize.updateTextFields();
      // console.log('retdddd', ret)
      if (ret.destinationTipsInclude == true) {
        // console.log('ff1')
        $('#destinationTipsInclude').trigger('click');
        $('#dos_and_donts_div').removeClass('hide');
        $('#app_preview_destination_dos').removeClass('hide');
      }
      if (ret.otherDetailsInclude == true) {
        $('#otherDetailsInclude').trigger('click');
        // console.log('ff2')
        $('#getting_there_div').removeClass('hide');
        $('#app_preview_destination_places').removeClass('hide');
      }
      if (ret.placesToVisitInclude == true) {
        $('#placesToVisitInclude').trigger('click');
        // console.log('ff3')
        $('#places_to_visit_div').removeClass('hide');
        $('#app_preview_destination_places_travel').removeClass('hide');
      }
      if (ret.basicInfo.destinationName) {
        $('#destination-location').val(ret.basicInfo.destinationName);
        $('select').material_select();
      }
    }, 100);
    return ret;
  }
});

Template.app_add_destination_settings.events({
  'click #destination_overview_preview'(event, template) {
    updateOverview();
  },
  'click #destination_travel_preview'(event, template) {
    updateTravel();
  },
  'click #destination_dos_preview'(event, template) {
    updateDos();
  },
  'click #destination_place_preview'(event, template) {
    updateAppPreviewPlaces();
  },
  'click #otherDetailsInclude'(event, template) {
    // console.log('enter');
    if ($('#otherDetailsInclude').prop('checked')) {
      $('#getting_there_div').removeClass('hide');
      $('#app_preview_destination_places').removeClass('hide');
    } else {
      $('#getting_there_div').addClass('hide');
      $('#app_preview_destination_places').addClass('hide');
    }
  },

  'click #destinationTipsInclude'(event, template) {
    // console.log('enter2');
    if ($('#destinationTipsInclude').prop('checked')) {
      $('#dos_and_donts_div').removeClass('hide');
      $('#app_preview_destination_dos').removeClass('hide');
    } else {
      $('#dos_and_donts_div').addClass('hide');
      $('#app_preview_destination_dos').addClass('hide');
    }
  },

  'click #placesToVisitInclude'(event, template) {
    // console.log('enter3');
    if ($('#placesToVisitInclude').prop('checked')) {
      $('#places_to_visit_div').removeClass('hide');
      $('#app_preview_destination_places_travel').removeClass('hide');
    } else {
      $('#places_to_visit_div').addClass('hide');
      $('#app_preview_destination_places_travel').addClass('hide');
    }
  },

  'change .use-page'(event, template) {
    var pageNo = parseInt(template.$(event.target).attr('data'));
    let pages = showPages.get();
    pages[pageNo] = !pages[pageNo];
    showPages.set(pages);
  },

  'submit #add-new-destination'(event, template) {
    event.preventDefault();
    template.$('button.btn').addClass('disabled');
    var data = template.$(event.target).serializeObject();
    data.eventId = FlowRouter.getParam("id");
    var fileInputs = template.$('input[type="file"]');
    var flag = 0;
    let ed = editing.get();
    if (data.destinationTipsInclude) {
    }
    else {
      data.destinationTipsInclude = false;
      delete data['destinationTips'];
    }
    if (data.otherDetailsInclude) {
      for (var i = 0; i < data.otherDetails.destinationCurrency.length; i++) {
        if (!((data.otherDetails.destinationCurrency[i].from != "" && data.otherDetails.destinationCurrency[i].rate != "" && data.otherDetails.destinationCurrency[i].to != "") || (data.otherDetails.destinationCurrency[i].from == "" && data.otherDetails.destinationCurrency[i].rate == "" && data.otherDetails.destinationCurrency[i].to == ""))) {
          showError('Enter value in all fields of one currency');
          template.$('button.btn').removeClass('disabled');
          flag = 1;
        }
      }
    } else {
      data.otherDetailsInclude = false;
      delete data['otherDetails'];
    }
    if (data.placesToVisitInclude) {
      for (var i = 0; i < data.placesToVisit.destinationPlacesToVisit.length; i++) {
        if (!((data.placesToVisit.destinationPlacesToVisit[i].description != "" && data.placesToVisit.destinationPlacesToVisit[i].title != "") || (data.placesToVisit.destinationPlacesToVisit[i].description == "" && data.placesToVisit.destinationPlacesToVisit[i].title == ""))) {
          showError('Enter value in all fields of one place');
          template.$('button.btn').removeClass('disabled');
          flag = 1;
        }
      }
    } else {
      data.placesToVisitInclude = false;
      delete data['placesToVisit'];
    }
    if (flag == 0) {
      var dataClone = JSON.parse(JSON.stringify(data));
      let stubUpload = StubUploadFiles(fileInputs, 3, true);
      dataClone = Object.assign(dataClone, stubUpload);
      var validationContext = AppDestinationSchema.newContext();
      validationContext.validate(dataClone, { clean: true });

      if (!validationContext.isValid()) {
        showError(validationContext.validationErrors()[0]);
        template.$('button.btn').removeClass('disabled');
        return;
      }
      UploadFiles(fileInputs, 3, true).then((res) => {
        data = Object.assign(data, res);
        let cbText = ed ? "Destination details updated" : "Destination details added";
        const activityEvent  = ed ? 'Update' : 'Add';
        let cb = (err, res) => {
          if (err) {
            showError(err);
            template.$('button.btn').removeClass('disabled');
            return;
          }
          showSuccess(cbText);
          template.$('button.btn').removeClass('disabled');
          window.history.back();
          template.$(event.target)[0].reset();
          activityInsertData = {
            eventId: data.eventId,
            activityModule: 'App Settings',
            activitySubModule: 'Destination',
            event: activityEvent,
            activityMessage: cbText + ' - ' + data.basicInfo.destinationName
          }
          activityRecordInsert(activityInsertData);  
          
        };

        if (ed) {
          data.destinationId = editingId.get();
          let app = App_General.findOne();
          let updatedData = data;
          if (app) {
            let destination = _.find(app.destinationDetails, d => { return d._id === data.destinationId; });
            let pages = showPages.get();
            for (var i = 0; i < pages.length; i++) {
              let hasPage = pages[i];
              let key = pagesToNumbers[i];
              if (!hasPage && key !== '') {
                destination[key] = null;
              }
            }
            // console.log('updatedData', data)
            updatedData = Object.assign(destination, data);
          }
          updateAppDestination.call(updatedData, cb);  //change
        }
        else {
          // console.log('insert data', data);
          insertAppDestination.call(data, cb)   //change
        }
        editing.set(false);
      }).catch(err => { showError(err); template.$('button.btn').removeClass('disabled'); });
    }
  }
});


Template.single_destination_card.events({
  'click .click_edit-button'(event, template) {
    editing.set(true);
    let id = FlowRouter.getParam("id");
    let editId = template.data.destination._id;
    editingId.set(editId)
    FlowRouter.go('events.app.destination.add', { id: id }, { editId });
    Meteor.setTimeout(() => {
      updateAppPreviewPlaces();
      updateDos();
      updateTravel();
      updateOverview();
    }, 200);
  },
  'click .click_delete-button'(event, template) {
    mbox.confirm('Are you sure?', (yes) => {
      if (!yes) return;
      let eventId = FlowRouter.getParam("id");
      let destinationId = template.data.destination._id;
      const destinationName = template.data.destination.basicInfo.destinationName;
      deleteAppDestination.call({ eventId, destinationId }, (err, res) => {
        if (err) { showError(err); template.$('button.btn').removeClass('disabled'); }
        else {
          showSuccess("Removed destination details");
          // template.$('button.btn').removeClass('disabled');
          activityInsertData = {
            eventId: eventId,
            activityModule: 'App Settings',
            activitySubModule: 'Destination',
            event: 'Delete',
            activityMessage: `Destination deleted - ${destinationName}`
          }
          activityRecordInsert(activityInsertData);
        }
      });
    });
  }
});


function toArray(fileList) {
  return Array.prototype.slice.call(fileList);
}
function fileUploadName(f, name) {
  if (!f) {
    return "";
  }
  var extension = f.type.split("/")[1];
  return name + "." + extension;
}

function updateOverview() {
  //let image1=$('#overview #main-image').attr('data-default-file');
  let image1 = $('#add-destination-modal #overview .dropify-preview .dropify-render img').attr('src')
  let place = $('#overview #gift_name').val();
  let placedetails = $('#overview textarea[name="basicInfo[aboutDestination]"]').val();
  let placename = $('#destination-location').val();
  // console.log('image1', image1);
  if (typeof image1 != 'undefined' && image1.length > 0) {
    $('#main_event_banner').css('background-image', 'url(' + image1 + ')');
  }
  if (typeof place != 'undefined' && description3.length > 0) {
    $('#overview #placename').html(place);
  }
  if (typeof placename != 'undefined' && placename.length > 0) {
    $('#overview #placename').html(placename);
    $('#overview #destination_name1').html(placename);
    $('#dosDestinationName').html(placename);
    $('#generalDestinationName').html(placename);
  }
  if (typeof placedetails != 'undefined' && placedetails.length > 0) {
    $('#overview #placedetails').html(placedetails);
  }
}


function updateTravel() {

  let image1 = $('#add-destination-modal #travel .dropify-preview .dropify-render img').attr('src')   //$('#travel #input-file-now').attr('data-default-file');

  let airport = $('#travel #destinationAirport').val();

  let timezone = $('#travel #destinationTimezone').val();

  let max = $('#travel #destinationWeatherMax').val();

  let min = $('#travel #destinationWeatherMin').val();

  let rate1 = $('#travel #destinationCurrencyRate1').val();

  let rate2 = $('#travel #destinationCurrencyRate2').val();

  let rate3 = $('#travel #destinationCurrencyRate3').val();

  let from1 = $('#travel #destinationCurrencyFrom1').val();

  let from2 = $('#travel #destinationCurrencyFrom2').val();

  let from3 = $('#travel #destinationCurrencyFrom3').val();

  let to1 = $('#travel #destinationCurrencyTo1').val();

  let to2 = $('#travel #destinationCurrencyTo2').val();

  let to3 = $('#travel #destinationCurrencyTo3').val();


  // console.log('travle image', image1);


  if (typeof image1 != 'undefined' && image1.length > 0) {

    $('#getting_there_banner').css('background-image', 'url(' + image1 + ')');



  }

  if (typeof airport != 'undefined' && airport.length > 0) {

    $('#travel #airport').html(airport);

  }

  if (typeof timezone != 'undefined' && timezone.length > 0) {

    $('#travel #timezone').html(timezone);

  }

  if (typeof max != 'undefined' && max.length > 0 && typeof min != 'undefined' && timezone.length > 0) {

    $('#travel #weather').html('Max : ' + max + ' &#x2103; <br>   Min : ' + min + ' &#x2103;');

  }

  if (typeof rate1 != 'undefined' && rate1.length > 0 && typeof from1 != 'undefined' && from1.length > 0 && typeof to1 != 'undefined' && to1.length > 0) {

    $('#travel #currency1').html('1 ' + from1 + ' &#x2194; ' + to1 + " " + rate1);

  }

  if (typeof rate2 != 'undefined' && rate2.length > 0 && typeof from2 != 'undefined' && from2.length > 0 && typeof to2 != 'undefined' && to2.length > 0) {

    $('#travel #currency2').html('1 ' + from2 + ' &#x2194; ' + to2 + " " + rate2);

  }

  if (typeof rate3 != 'undefined' && rate3.length > 0 && typeof from3 != 'undefined' && from3.length > 0 && typeof to3 != 'undefined' && to3.length > 0) {

    $('#travel #currency3').html('1 ' + from3 + ' &#x2194; ' + to3 + " " + rate3);

  }



}


function updateDos() {

  let image1 = $('#add-destination-modal #dos .dropify-preview .dropify-render img').attr('src')     //$('#dos #input-file-now').attr('data-default-file');

  let do1 = $('#dos #destinationDos1').val();

  let do2 = $('#dos #destinationDos2').val();

  let do3 = $('#dos #destinationDos3').val();

  let do4 = $('#dos #destinationDos4').val();

  let dont1 = $('#dos #destinationDonts1').val();

  let dont2 = $('#dos #destinationDonts2').val();

  let dont3 = $('#dos #destinationDonts3').val();

  let dont4 = $('#dos #destinationDonts4').val();

  // console.log('image dos ', image1);

  if (typeof image1 != 'undefined' && image1.length > 0) {

    $('#dos_banner').css('background-image', 'url(' + image1 + ')');

  }

  if (typeof do1 != 'undefined' && do1.length > 0) {

    $('#dos #do1').html(do1);

  }

  if (typeof do2 != 'undefined' && do2.length > 0) {

    $('#dos #do2').html(do2);

  }

  if (typeof do3 != 'undefined' && do3.length > 0) {

    $('#dos #do3').html(do3);

  }

  if (typeof do4 != 'undefined' && do4.length > 0) {

    $('#dos #do4').html(do4);

  }

  if (typeof dont1 != 'undefined' && dont1.length > 0) {

    $('#dos #dont1').html(dont1);

  }

  if (typeof dont2 != 'undefined' && dont2.length > 0) {

    $('#dos #dont2').html(dont2);

  }

  if (typeof dont3 != 'undefined' && dont3.length > 0) {

    $('#dos #dont3').html(dont3);

  }

  if (typeof dont4 != 'undefined' && dont4.length > 0) {

    $('#dos #dont4').html(dont4);

  }


}


function updateAppPreviewPlaces() {

  let image1 = $('[name="placesToVisitImage1"]').parent('.dropify-wrapper').find('.dropify-render img').attr('src');            //$('#places input[name="placesToVisitImage1"]').sibling().attr('src');

  let image2 = $('[name="placesToVisitImage2"]').parent('.dropify-wrapper').find('.dropify-render img').attr('src');           //$('#places input[name="placesToVisitImage2"]').attr('data-default-file');

  let image3 = $('[name="placesToVisitImage3"]').parent('.dropify-wrapper').find('.dropify-render img').attr('src');
  $('#places input[name="placesToVisitImage3"]').attr('data-default-file');

  let title1 = $('#places #destinationPlacesToVisitTitle1').val();

  let description1 = $('#places #destinationPlaceToVisitDescription1').val();

  let title2 = $('#places #destinationPlacesToVisitTitle2').val();

  let description2 = $('#places #destinationPlaceToVisitDescription2').val();

  let title3 = $('#places #destinationPlacesToVisitTitle3').val();

  let description3 = $('#places #destinationPlaceToVisitDescription3').val();



  // console.log('val  ', image1, image2, image3);


  if (typeof image1 != 'undefined' && image1.length > 0) {

    $('#places #image1').css('background-image', 'url(' + image1 + ')');

    $('#places #image1').html('');

  }

  if (typeof image2 != 'undefined' && image2.length > 0) {

    $('#places #image2').css('background-image', 'url(' + image2 + ')');

    $('#places #image2').html('');

  }

  if (typeof image3 != 'undefined' && image3.length > 0) {

    $('#places #image3').css('background-image', 'url(' + image3 + ')');

    $('#places #image3').html('');

  }

  if (typeof title1 != 'undefined' && title1.length > 0) {

    $('#places #title1').html(title1);

  }

  if (typeof title2 != 'undefined' && title2.length > 0) {
    $('#places #title2').html(title2);
  }

  if (typeof title3 != 'undefined' && title3.length > 0) {
    $('#places #title3').html(title3);
  }

  if (typeof description1 != 'undefined' && description1.length > 0) {
    $('#places #description1').html(description1);
  }

  if (typeof description2 != 'undefined' && description2.length > 0) {
    $('#places #description2').html(description2);
  }

  if (typeof description3 != 'undefined' && description3.length > 0) {
    $('#places #description3').html(description3);
  }

}
