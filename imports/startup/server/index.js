import { Meteor } from 'meteor/meteor';
import { WebAppInternals } from 'meteor/webapp';
const publicSettings = Meteor.settings?.public;

// import { onPageLoad } from 'meteor/server-render';
// import React from 'react';
// import { StaticRouter } from 'react-router';
// import { renderToPipeableStream } from 'react-dom/server';
import { Accounts } from 'meteor/accounts-base';
// import { Helmet } from 'react-helmet';
// import { ServerStyleSheet } from 'styled-components';
// import Routes from '../../ui/pages/Routes';

import './api';
import './migrations';

const cdnserver = publicSettings?.cdnserver;

Meteor.startup(() => {
  const smtp = Meteor.settings?.mailCredentials?.smtp;

  process.env.MAIL_URL = `smtps://${encodeURIComponent(smtp.userName)}:${smtp.password}@${
    smtp.host
  }:${smtp.port}`;
  Accounts.emailTemplates.resetPassword.from = () => smtp.fromEmail;
  Accounts.emailTemplates.from = () => smtp.fromEmail;
  Accounts.emailTemplates.resetPassword.text = function (user, url) {
    const newUrl = url.replace('#/', '');
    return `To reset your password, simply click the link below. ${newUrl}`;
  };
});

if (cdnserver) {
  WebAppInternals.setBundledJsCssUrlRewriteHook((url) => {
    console.log(url);
    return cdnserver + url;
  });
}

// const render = async (sink) => {
//   const context = {};
//   const WrappedApp = (
//     <StaticRouter location={sink.request.url} context={context}>
//       <Routes />
//     </StaticRouter>
//   );

//   try {
//     const sheet = new ServerStyleSheet();
//     // const html = sheet.collectStyles(WrappedApp);
//     // const htmlStream = sheet.interleaveWithNodeStream(renderToPipeableStream(html));
//     const htmlStream = renderToPipeableStream(WrappedApp);
//     // console.log(html);

//     const helmet = Helmet.renderStatic();
//     sink.appendToHead(helmet.title.toString());
//     sink.appendToHead(helmet.meta.toString());
//     sink.appendToHead(sheet.getStyleTags());

//     sink.renderIntoElementById('root', htmlStream);
//   } catch (e) {
//     console.error(e);
//   }
// };

// onPageLoad(render);
