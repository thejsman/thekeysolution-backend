import { FlowRouter } from 'meteor/kadira:flow-router'
import { ReactiveVar } from 'meteor/reactive-var'
import { showError, showSuccess } from '../../../components/notifs/notifications.js'
import { UploadFiles } from '../../../../api/upload/S3Uploads'
import { photoShareSetting, addPhotos, editPhotos, deletePhotos, getPhotosCount } from '../../../../api/photo_share/methods'
import { Photos, PhotoShareSetting } from '../../../../api/photo_share/photo_share'
import { Guests } from '../../../../api/guests/guests'

import './photo_share.html'
import './photo_share_settings.html'
import './photo_share.scss'
import './photo_form.html'

import '../../../components/preloader/preloaders'

//  Total no of photos to be shown on single page
const itemPerPage = 25;

// All reactive variables for search, sort and fetching data from server
// TODO: Make all these reactive variables template scoped, currently these are not linked with templates

let totalPhotosCount = new ReactiveVar(0)
let currentPage = new ReactiveVar(0)
let skipCount = new ReactiveVar(0)
let searchTerm = new ReactiveVar('')
let featureFilter = new ReactiveVar([])
let statusFilter = new ReactiveVar([])
let stickyFilter = new ReactiveVar([])
let oldPage = 0;
let tempPage = -1;

// Update pagination on filter options changes
function updatePagination() {
  if (tempPage == -1) {
    oldPage = skipCount.get();
    skipCount.set(0);
  }
  tempPage = 1;
}

// Reset all the reactive variables on template creation
Template.photo_share.onCreated(function(){
  this.autorun(() =>{
    totalPhotosCount.set(0)
    currentPage.set(0)
    skipCount.set(0)
    searchTerm.set('')
    featureFilter.set([])
    statusFilter.set([])
    stickyFilter.set([])
  });
});

// All subscriptions are here because they needs to updated on changing filter options
Template.photo_share.onRendered(function () {
  this.$('select').material_select()
  this.autorun(() => {
    const eventId = FlowRouter.getParam("id");
    let filter = [...featureFilter.get(), ...statusFilter.get(), ...stickyFilter.get()];
    this.subscribe('photos.event', eventId, skipCount.get(), searchTerm.get(), itemPerPage, filter);
    this.subscribe('guests.event', eventId);
    this.subscribe('photos.settings', eventId);
    getPhotosCount.call({ eventId, searchTerm: searchTerm.get(), filterOption: filter }, (err, res) => {
      if (err) {
        console.error("getPhotosCount Error ::", err)
      } else {
        totalPhotosCount.set(res)
      }
    })
  })
})

/**
 * Check checkboxes by elementID
 * @param {string} elementId - elementID
 */

function tickCheckbox(elementId) {
  $(`#${elementId}`).prop('checked', true)
}

// All helpers for main Photos list page
Template.photo_share.helpers({
  newPhotoRoute: () => {
    return FlowRouter.path('events.photos.new', {
      id: FlowRouter.getParam('id')
    })
  },

  // All photos for the event
  photos: () => {
    const query = { eventId: FlowRouter.getParam("id"), isDeleted : false };
    const options = { sort : { createdAt : -1 } };
    return Photos.find(query, options);
  },

  // Check if photos exists or not
  totalPhotos: () => {
    return totalPhotosCount.get() ? true : true
  },

  // Pagination
  getPagination : () => {
    let totalPhotos = totalPhotosCount.get()
    let pages = 0
    if ((totalPhotos % itemPerPage) == 0) {
      pages = Math.floor(totalPhotos / itemPerPage);
    } else {
      pages = Math.floor(totalPhotos / itemPerPage) + 1
    }

    let pageList = [];
    for (var i = 0; i < pages; i++) {
      pageList.push({
        pageNo: i,
        isActive: currentPage.get() === i ? "active" : ""
      })
    }
    return pageList
  }
})

// Events for main templates
Template.photo_share.events({
  // Pagination Events
  'click .page-no'(event, template) {
    let count = parseInt(event.target.id);
    currentPage.set(count);
    skipCount.set(count * itemPerPage);
  },

  'click #page-minus'(event, template) {
    let cP = currentPage.get();
    if(cP > 0) {
      let final = cP - 1;
      currentPage.set(final);
      skipCount.set(final * itemPerPage);
    }
    },

  'click #page-plus'(event, template) {
    let cP = currentPage.get();
    let totalPhotos = totalPhotosCount.get()
    let pages=0;
    if((totalPhotos%itemPerPage)==0){
        pages = Math.floor(totalPhotos/itemPerPage) ;
    }
    else{
      pages = Math.floor(totalPhotos/itemPerPage) +1 ;
    }
    if((cP+1) < pages) {
      let final = cP + 1;
      currentPage.set(final);
      skipCount.set(final * itemPerPage)
    }
  },

  // Filter Options
  'change #photoFeatured'(event, template) {
    featureFilter.set(template.$(event.target).val());
    updatePagination();
  },

  'change #photoStatus'(event, template) {
    statusFilter.set(template.$(event.target).val());
    updatePagination();
  },

  'change #photoSticky'(event, template) {
    stickyFilter.set(template.$(event.target).val());
    updatePagination();
  }
})

// Single photo card events 
Template.single_photo.events({
  'click .click_edit_btn'(event, template) {
    event.preventDefault()
    FlowRouter.go('events.photos.single', {
      id: FlowRouter.getParam("id"),
      photoId: template.data.photo._id
    })
  },

  'click .click_delete_btn'(event, template) {
    event.preventDefault()
    let photoId = template.data.photo._id
    mbox.confirm('Are you sure to delete this image ?', function (yes) {
      if (yes) {
        deletePhotos.call(photoId, (err, res) => {
          if (err) {
            showError(err);
          } else {
            showSuccess('Photo Deleted.')
          }
        })
      }
    })
  }
})

// Single photo card helpers
Template.single_photo.helpers({
  isPublished : (text) => {
    return (text === 'published')
  },
  author : (id) => {
    const guest = Guests.find({ _id : id }).fetch();
    const host = PhotoShareSetting.findOne({});

    if(guest && guest.length > 0) {
      return `${guest[0].guestFirstName} ${guest[0].guestLastName}`;
    } else if(host && host.host) {
      return host.host;
    } else {
      return 'Host';
    }
  }
})
// ==============================//
// ======Settings page for photoshare=======//
//==============================//
Template.photo_share_settings.onRendered(function () {
  this.autorun(() => {
    this.subscribe('photos.settings', FlowRouter.getParam("id"))
    Meteor.setTimeout(() => {
      let settings = PhotoShareSetting.findOne({})
      if (settings && settings.like) {
        tickCheckbox('like')
      }
      if (settings && settings.comment) {
        tickCheckbox('comment')
      }
      if (settings && settings.share) {
        tickCheckbox('share')
      }
      if (settings && settings.download) {
        tickCheckbox('download')
      }
      if (settings && settings.host) {
        $('#host').val(settings.host)
      }
    }, 100);
  })
})

Template.photo_share_settings.events({
  'submit #photoShareSetting'(event, template) {
    event.preventDefault()
    let target = template.$(event.target)
    let formData = target.serializeObject()
    let data = {
      eventId: FlowRouter.getParam("id"),
      host: formData.host,
      download: formData.download ? true : false,
      like: formData.like ? true : false,
      share: formData.share ? true : false,
      comment: formData.comment ? true : false
    }

    photoShareSetting.call(data, (err, res) => {
      if (err) {
        showError(err);
      } else {
        showSuccess('Photo Share Settings updated.')
      }
    })
  }
})

//==========================//
// ====== Add/Edit Photo Form ======//
// =========================//
Template.photo_form.onCreated(function () {
  this.isEdit = new ReactiveVar(false)
  this.isLoading = new ReactiveVar(false)
  this.isFeatured = new ReactiveVar(false)
})

Template.photo_form.onRendered(function () {
  this.autorun(() => {
    this.subscribe('photos.one', FlowRouter.getParam('photoId'))
    Meteor.setTimeout(() => {
      this.$('select').material_select()
      this.$('.dropify').dropify()
      if (FlowRouter.getParam('photoId')) {
        this.isEdit.set(true)
      } else {
        this.isEdit.set(false)
      }
    }, 100);

    // Update Form values
    if (this.isEdit.get()) {
      let photo = Photos.findOne({
        _id: FlowRouter.getParam('photoId')
      })
      if (photo && photo.sticky) {
        tickCheckbox('sticky')
      }
      if (photo && photo.status) {
        $(`#status`).val(photo.status)
      }

      // Image preview
      let file = photo && photo.url
      if (typeof file != 'undefined' && file.length > 0) {
        $('.dropify-render').html('<img src="' + file + '">')
        $('.dropify-wrapper .dropify-preview').css('display', 'block')
      }

      if(photo && !photo.featured) {
        this.isFeatured.set(true)
      }
    }
  })
})

Template.photo_form.helpers({
  title: () => {
    return Template.instance().isEdit.get() ? 'Editing photo ' : 'Add new photo'
  },

  photo: () => {
    if (Template.instance().isEdit.get()) {
      return Photos.findOne({
        _id: FlowRouter.getParam('photoId')
      })
    }
    return ''
  },

  showLoader: () => {
    return Template.instance().isLoading.get()
  },

  moveToFeatured: () => {
    return Template.instance().isFeatured.get()
  }
})

Template.photo_form.events({

  'submit #photoForm'(event, template) {
    event.preventDefault()
    // Set Loading
    template.isLoading.set(true)
    let form = template.$(event.target)
    let d2 = form.serializeObject()
    let data = {
      eventId: FlowRouter.getParam('id'),
      sticky: d2.sticky ? true : false,
      status: d2.status,
      caption: d2.caption,
      featured : d2.featured,
    }
    var fileInputs = template.$('input[type="file"]')

    UploadFiles(fileInputs, 1, true).then((res) => {
      data.url = res.url
      if (template.isEdit.get()) {
        data.photoId = FlowRouter.getParam('photoId')
        data.updatedBy = Meteor.userId()
        data.updatedAt = new Date().toISOString()
        editPhotos.call(data, (err, res) => {
          if (err) {
            showError(err)
            template.isLoading.set(false)
          } else {
            FlowRouter.go('events.photos', {
              id: FlowRouter.getParam("id")
            })
            template.isLoading.set(false)
            FlowRouter.go('events.photos', {
              id: FlowRouter.getParam("id")
            })
            showSuccess("Photo Updated")
          }
        })
      } else {
        data.featured = true
        data.createdBy = Meteor.userId()
        data.createdAt = new Date().toISOString()
        addPhotos.call(data, (err, res) => {
          if (err) {
            template.isLoading.set(false)
            showError(err);
          } else {
            template.isLoading.set(false)
            FlowRouter.go('events.photos', {
              id: FlowRouter.getParam("id")
            })
            showSuccess("Photo Uploaded")
          }
        })
      }
    }).catch((err) => {
      showError(err)
    });
  },
})