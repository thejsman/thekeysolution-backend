export default (options, domain, type, token) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
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
                  <p>You've been invited to be a user on The Key Dashboard</p>
                </td>
              </tr>
            </table>

        <table class="module" role="module" data-type="text" border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
          <tr>
            <td style="padding:18px 20px 18px 20px;line-height:22px;text-align:inherit;" height="100%" valign="top" bgcolor="">

          <div>Dear ${options.username}</div>
          <div>&nbsp;</div>
          <div>In an endeavor towards a more streamlined, digital, cohesive platform for managing events and creating efficiencies, we’d like to invite you to log-in to our exclusive <a href="${ domain }/public/invite/${ type }/${ token }">Key Workstation</a>.</div>
          <div>&nbsp;</div>
          <div>Your login ID is: ${options.email}</div>
          <div>Please choose a password of your liking and bookmark the page for easier access in the future.</div>

          <div>The software is fairly easy to use; but in case you do need any assistance, The Key Team will be available to chat – assist you, right on your Workstation.</div>
          <br />
          <div style="background: #ccc; padding: 5px; border-radius: 10px;"><span style="font-weight: bold;">Note:</span> Once you have set your password, visit <a href="https://thekeysolution.in" target="_blank">https://thekeysolution.in</a> to access your Key Workstation.</div>
          <div style="margin-top : 50px;">With regards, </div>
          <div>${options.agencyUser}</div>
          <div>${options.agencyName}</div>
          <div>P.S.: In case you are having difficulties signing up, please contact: support@thekeysolution.com</div>

      </td>
          </tr>
        </table>

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
  </html>`;
};
