import { FlowRouter } from 'meteor/kadira:flow-router';
import './agencyDownload.html'
import './agencyDownload.scss'
import { Guests } from '../../../../../api/guests/guests'
import { requestDownload, uploadZip, uploadZip2 } from '../../../../../api/downloads/methods'
import Fuse from 'fuse.js'
import _ from 'lodash'
import JSZip from 'jszip'
import JSZipUtils from 'jszip-utils'
import { showSuccess, showError } from '../../../../components/notifs/notifications'

/**
 * Fuse.js options for Guest Search
 * Docs : https://fusejs.io/
 */

const fuseOptions = {
  shouldSort: true,
  threshold: 0.4,
  maxPatternLength: 32,
  minMatchCharLength: 2,
  keys: [{
    name: 'folioNumber',
    weight: 0.3
  }, {
    name: 'guestFirstName',
    weight: 0.2
  }, {
    name: 'guestLastName',
    weight: 0.2
  }, {
    name: 'guestPersonalEmail',
    weight: 0.3
  }]
};

/**
 * Get File from URL
 * @param {string} url - url of file
 */

function urlToPromise(url) {
  return new Promise(function (resolve, reject) {
    JSZipUtils.getBinaryContent(url, function (err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * Download files from server response
 * @param {*} res response from requestDownload Method
 */

const zipAndUpload = (res) => {
  const { files, response } = res;
  const id = response;
  var zip = new JSZip();
  // Go through all guest download folders
  _.each(files, (gt) => {
    const guestFolderName = gt.name
    let guestFolder = zip.folder(guestFolderName)
    const guestFiles = []

    // Iterate throgh each guest files
    _.each(gt.files, (list, key) => {

      _.each(list, (item, index) => {
        _.each(item, (key2, value) => {
          const ext = key2.split('.').pop();
          guestFiles.push({
            name: `${gt.name}-${index}-${value + 1}.${ext}`,
            url: key2
          })
        })
      });
    });

    guestFiles.map(file => {
      const { name, url } = file
      if (url && url !== null) {
        guestFolder.file(
          name,
          urlToPromise(url),
          { binary: true }
        )
      }

      return
    })
  });

  zip.generateAsync({ type: 'blob' })
    .then(blob => {
      showSuccess("We are processing your request, you will receive an email with download link.");
      uploadZip({ blob, id }).then(data => {
        console.log('Upload Sucess :: ', data)
        FlowRouter.go('events.summary', {
          id: FlowRouter.getParam("id")
        })
      })
    });
};

// === === === === === === === === === === === === === === === //
// === === === === Agency Download Request === === === === === //
// === === === === === === === === === === === === === === === //

Template.agencyDownload.onCreated(function () {
  const eventId = FlowRouter.getParam('id')
  const subscription = this.subscribe('guests.all', eventId)

  /**
   * Template scoped reactive variables 
   */
  this.selectedGuestCount = new ReactiveVar(0)
  this.guestResult = new ReactiveVar()
  this.selectedGuests = new ReactiveVar([])
  this.selectedDocs = new ReactiveVar([])
  this.selectAllText = new ReactiveVar('Select All')
  this.autorun(() => {
    if (subscription.ready()) {
      const guests = Guests.find({ eventId: eventId })
      this.guestResult.set(guests.fetch())
    } else {
      this.selectedGuestCount.set(0)
    }
  });
})

Template.agencyDownload.helpers({
  // Returns all guest for this event
  // Updates on Search Query 
  guests: () => {
    const selectedGuests = Template.instance().selectedGuests.get()
    const guestResult = Template.instance().guestResult.get()
    return guestResult ? guestResult.map(guest => {
      const { _id, guestFirstName, guestLastName, folioNumber, guestPersonalEmail } = guest
      if (_.includes(selectedGuests, _id)) {
        return {
          id: _id,
          name: `${guestFirstName} ${guestLastName}`,
          folio: folioNumber,
          email: guestPersonalEmail,
          selected: true
        }
      } else {
        return {
          id: _id,
          name: `${guestFirstName} ${guestLastName}`,
          folio: folioNumber,
          email: guestPersonalEmail,
          selected: false
        }
      }
    }) : ''
  },
  /**
   * Total guests selected count for download request
   */
  selectedGuestCount: () => {
    const selectedGuests = Template.instance().selectedGuests.get()
    return selectedGuests.length
  },

  /**
   * Label for select all checkbox
   */
  selectAllText: () => {
    return Template.instance().selectAllText.get()
  }
})

Template.agencyDownload.events({
  /**
   * Handle Guest Search
   * @param {object} - DOM event
   * @param {object} - Template data
   */
  'keyup #searchGuests': (event, template) => {
    event.preventDefault();
    const guests = Guests.find({}).fetch();
    const fuse = new Fuse(guests, fuseOptions);
    if (event.target.value.length > 1) {
      const result = fuse.search(event.target.value);
      template.guestResult.set(fuse.search(event.target.value));
    } else {
      template.guestResult.set(guests)
    }
  },

  /**
   * Checkbox for each guest
   */
  'change .guest-list input[type="checkbox"]': (event, template) => {
    event.preventDefault();
    let selectGuests = _.clone(template.selectedGuests.get())
    if (event.target.checked) {
      selectGuests.push(event.target.value);
    } else {
      selectGuests = selectGuests.filter(id => id !== event.target.value)
    }
    template.selectedGuests.set(selectGuests)
  },

  /**
   * Checkbox for select all guests
   */
  'change input#selectallGuest': (event, template) => {
    event.preventDefault()
    const target = $('.guest-list input[type="checkbox"]')
    if (event.target.checked) {
      // Mark all guests selected if checked
      const selectedList = _.clone(template.guestResult.get())
      const guestIds = selectedList.map(guest => guest._id)
      template.selectedGuests.set(guestIds)
      template.selectAllText.set('Deselect All')
      target.prop('checked', true)
    } else {
      template.selectedGuests.set([])
      template.selectAllText.set('Select All')
      target.prop('checked', false)
    }
  },

  // Checkbox for download documet options
  'change .docs-list input[type="checkbox"]': (event, template) => {
    event.preventDefault();
    let selectDocs = _.clone(template.selectedDocs.get())
    if (event.target.checked) {
      selectDocs.push(event.target.value);
    } else {
      selectDocs = selectDocs.filter(item => item !== event.target.value)
    }
    template.selectedDocs.set(selectDocs)
  },

  // Submit final request
  'click #submitRequest': (event, template) => {
    event.preventDefault()
    const eventId = FlowRouter.getParam('id')
    const selectedGuests = template.selectedGuests.get()
    const selectedDocs = template.selectedDocs.get()
    if (Template.instance().selectedGuests.get().length === 0) {
      showError("Please select at least one guest.")
      return null;
    }
    if (selectedDocs.length === 0) {
      showError("Select at least one document to download.");
      return null
    }
    requestDownload.call({ eventId, guestIds: selectedGuests, docs: selectedDocs }, (err, res) => {
      if (err) {
        console.log('Error on Method :: ', err)
        return
      }
      console.log('Response ::', res);
      zipAndUpload(res);
    })
  }
})