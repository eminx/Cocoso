import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Helmet } from 'react-helmet';

const publicSettings = Meteor?.settings?.public;

export default function HelmetHybrid({ Host }) {
  if (!Host) {
    return null;
  }
  const lang = Host.settings?.lang;

  return (
    <Helmet htmlAttributes={{ lang }}>
      <link rel="canonical" href={Host.host} />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin />
      <link
        href="https://fonts.googleapis.com/css2?family=Raleway:wght@300;400;700&family=Sarabun:ital,wght@0,300;0,400;0,700;1,400&display=swap"
        rel="stylesheet"
      />
      <link
        rel="android-chrome-192x192"
        sizes="192x192"
        href={`${publicSettings.iconsBaseUrl}/android-chrome-192x192.png`}
      />
      <link
        rel="android-chrome-512x512"
        sizes="512x512"
        href={`${publicSettings.iconsBaseUrl}/android-chrome-512x512.png`}
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={`${publicSettings.iconsBaseUrl}/apple-touch-icon.png`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href={`${publicSettings.iconsBaseUrl}/favicon-32x32.png`}
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href={`${publicSettings.iconsBaseUrl}/favicon-16x16.png`}
      />
    </Helmet>
  );
}
