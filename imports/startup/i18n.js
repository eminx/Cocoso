import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import yaml from 'js-yaml';

const { cdnserver } = Meteor.settings;

const allLangs = [
  {
    value: 'en',
    label: 'English',
  },
  {
    value: 'sv',
    label: 'Svenska',
  },
  {
    value: 'tr',
    label: 'Türkçe',
  },
];

const defaultLang = 'en';

const namespaces = [
  'common',
  'accounts',
  'members',
  'hosts',
  'admin',
  'activities',
  'groups',
  'calendar',
  'resources',
];

const path = '/i18n/{{lng}}/{{ns}}.yml';
const loadPath = Meteor.isProduction && cdnserver ? cdnserver + path : path;

const options = {
  allowMultiLoading: false,
  backend: {
    loadPath,
    parse: function (data) {
      return yaml.load(data);
    },
  },
  debug: false,
  defaultNS: 'common',
  fallbackLng: 'en',
  lng: defaultLang,
  load: 'languageOnly',
  ns: 'common',
  only: '*',
  // preload: allLangs,
  saveMissing: true,
  supportedLngs: allLangs.map((l) => l.value),
  useSuspense: process && !process.release,
};

// for browser use http backend to load translations and browser lng detector
if (process && !process.release) {
  i18n.use(Backend).use(initReactI18next).use(LanguageDetector);
}

// initialize if not already initialized
if (!i18n.isInitialized) {
  i18n.init(options);
  // check & set lang for user(logged) or host prefences
  Tracker.autorun(() => {
    if (Meteor.isClient) {
      if (Meteor.userId()) {
        const handler = Meteor.subscribe('me');
        if (handler.ready()) {
          const userLang = Meteor.user()?.lang;
          i18n.changeLanguage(userLang);
        }
        return;
      }
    }
    Meteor.call('getCurrentHost', (error, respond) => {
      if (!error) {
        const hostLang = respond?.settings?.lang;
        i18n.changeLanguage(hostLang);
      }
    });
  });
}

export default i18n;
export { allLangs, defaultLang };
