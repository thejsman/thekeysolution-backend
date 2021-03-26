import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';
import { Roles } from 'meteor/meteor-roles';
import { Events } from '../../events/events.js';
import { Agencies } from '../../agencies/agencies.js';

export const sendRequest = (eventId) => {
  let users = Roles.getUsersInRole('superadmin');
  let event = Events.findOne(eventId);
  if(!event) {
    throw new Meteor.Error("Event not found");
  }
  let domain = Meteor.settings.domain;
  let agency = Agencies.findOne(event.basicDetails.agency);
  users.forEach(sa => {
    console.log(sa.emails[0].address);
    Email.send({
      to: sa.emails[0].address,
      from: "THE KEY <admin@thekey.com>",
      subject: `Request to build app for ${event.basicDetails.eventName}`,
      html: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html data-editor-version="2" class="sg-campaigns" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1" /><!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" /><!--<![endif]-->
    <!--[if (gte mso 9)|(IE)]>
    <xml>
    <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
    <!--[if (gte mso 9)|(IE)]>
    <style type="text/css">
      body {width: 600px;margin: 0 auto;}
      table {border-collapse: collapse;}
      table, td {mso-table-lspace: 0pt;mso-table-rspace: 0pt;}
      img {-ms-interpolation-mode: bicubic;}
    </style>
    <![endif]-->

    <style type="text/css">
      body, p, div {
	font-family: arial;
	font-size: 14px;
      }
      body {
	color: #000000;
      }
      body a {
	color: #1188E6;
	text-decoration: none;
      }
      p { margin: 0; padding: 0; }
      table.wrapper {
	width:100% !important;
	table-layout: fixed;
	-webkit-font-smoothing: antialiased;
	-webkit-text-size-adjust: 100%;
	-moz-text-size-adjust: 100%;
	-ms-text-size-adjust: 100%;
      }
      img.max-width {
	max-width: 100% !important;
      }
      .column.of-2 {
	width: 50%;
      }
      .column.of-3 {
	width: 33.333%;
      }
      .column.of-4 {
	width: 25%;
      }
      @media screen and (max-width:480px) {
	.preheader .rightColumnContent,
	.footer .rightColumnContent {
	    text-align: left !important;
	}
	.preheader .rightColumnContent div,
	.preheader .rightColumnContent span,
	.footer .rightColumnContent div,
	.footer .rightColumnContent span {
	  text-align: left !important;
	}
	.preheader .rightColumnContent,
	.preheader .leftColumnContent {
	  font-size: 80% !important;
	  padding: 5px 0;
	}
	table.wrapper-mobile {
	  width: 100% !important;
	  table-layout: fixed;
	}
	img.max-width {
	  height: auto !important;
	  max-width: 480px !important;
	}
	a.bulletproof-button {
	  display: block !important;
	  width: auto !important;
	  font-size: 80%;
	  padding-left: 0 !important;
	  padding-right: 0 !important;
	}
	.columns {
	  width: 100% !important;
	}
	.column {
	  display: block !important;
	  width: 100% !important;
	  padding-left: 0 !important;
	  padding-right: 0 !important;
	  margin-left: 0 !important;
	  margin-right: 0 !important;
	}
      }
    </style>
    <!--user entered Head Start-->

     <!--End Head user entered-->
  </head>
  <body>
    <center class="wrapper" data-link-color="#1188E6" data-body-style="font-size: 14px; font-family: arial; color: #000000; background-color: #ffffff;">
      <div class="webkit">
	<table cellpadding="0" cellspacing="0" border="0" width="100%" class="wrapper" bgcolor="#ffffff">
	  <tr>
	    <td valign="top" bgcolor="#ffffff" width="100%">
	      <table width="100%" role="content-container" class="outer" align="center" cellpadding="0" cellspacing="0" border="0">
		<tr>
		  <td width="100%">
		    <table width="100%" cellpadding="0" cellspacing="0" border="0">
		      <tr>
			<td>
			  <!--[if mso]>
			  <center>
			  <table><tr><td width="600">
			  <![endif]-->
			  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width:600px;" align="center">
			    <tr>
			      <td role="modules-container" style="padding: 0px 0px 0px 0px; color: #000000; text-align: left;" bgcolor="#ffffff" width="100%" align="left">

    <table class="module preheader preheader-hide" role="module" data-type="preheader" border="0" cellpadding="0" cellspacing="0" width="100%"
	   style="display: none !important; mso-hide: all; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0;">
      <tr>
	<td role="module-content">
	  <p>Please create the app based on the event parameters at this URL - <a href="http://${ domain }/events/${eventId}/app">LINK</a></p>
	</td>
      </tr>
    </table>

    <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
      <tr>
	<td style="padding:18px 20px 18px 20px;line-height:22px;text-align:inherit;"
	    height="100%"
	    valign="top"
	    bgcolor="">
	    <div>
<div style="font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 300; font-family: arial; font-size: 14px; color: rgb(0, 0, 0); background-color: rgb(255, 255, 255);">${agency.name} has requested app(s) for ${event.basicDetails.eventName}</div>

<div style="font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 300; font-family: arial; font-size: 14px; color: rgb(0, 0, 0); background-color: rgb(255, 255, 255);">Click <a href="${ domain }/events/${eventId}/app">here</a> to login to dashboard and review the parameters.</div>
</div>

	</td>
      </tr>
    </table>
  <div data-role="module-unsubscribe" class="module unsubscribe-css__unsubscribe___2CDlR" role="module" data-type="unsubscribe" style="color:#444444;font-size:12px;line-height:20px;padding:16px 16px 16px 16px;text-align:center"><div class="Unsubscribe--addressLine"><p class="Unsubscribe--senderName" style="font-family:Arial, Helvetica, sans-serif;font-size:12px;line-height:20px">The Key Dashboard</p></div></div>
			      </td>
			    </tr>
			  </table>
			  <!--[if mso]>
			  </td></tr></table>
			  </center>
			  <![endif]-->
			</td>
		      </tr>
		    </table>
		  </td>
		</tr>
	      </table>
	    </td>
	  </tr>
	</table>
      </div>
    </center>
  </body>
</html>`
    });
  });
};
