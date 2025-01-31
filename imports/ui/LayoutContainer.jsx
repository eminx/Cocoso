import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChakraProvider, ColorModeProvider, useMediaQuery } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import moment from 'moment';
import 'moment/locale/en-gb';
import 'moment/locale/sv';
import 'moment/locale/tr';
import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';

import { call } from './utils/shared';
import generateTheme from './utils/constants/theme';
import Header from './layout/Header';
import HelmetHybrid from './layout/HelmetHybrid';
import { Footer, PlatformFooter } from './layout/Footers';
import TopBarHandler from './layout/TopBarHandler';
import DummyWrapper from './layout/DummyWrapper';

export const StateContext = React.createContext(null);

dayjs.extend(updateLocale);

function LayoutPage({ currentUser, userLoading, children }) {
  const initialCurrentHost = window?.__PRELOADED_STATE__?.Host || null;
  const [platform, setPlatform] = useState(null);
  const [currentHost, setCurrentHost] = useState(initialCurrentHost);
  const [allHosts, setAllHosts] = useState(null);
  const [pageTitles, setPageTitles] = useState([]);
  const [hue, setHue] = useState('233');
  const [rendered, setRendered] = useState(false);
  const [tc, i18n] = useTranslation();
  const [isDesktop, isMobile] = useMediaQuery(['(min-width: 960px)', '(max-width: 480px)']);
  const location = useLocation();
  const { pathname } = location;

  useLayoutEffect(() => {
    setTimeout(() => {
      setRendered(true);
    }, 1000);
  }, []);

  useEffect(() => {
    moment.locale(i18n?.language || 'en-gb', {
      week: {
        dow: 1,
      },
    });
    dayjs.updateLocale('en', {
      weekStart: 1,
    });
  }, [i18n?.language]);

  const pathnameSplitted = pathname.split('/');

  useEffect(() => {
    if (pathnameSplitted[1][0] === '@' && !pathnameSplitted[3]) {
      return;
    }
    window.scrollTo(0, 0);
  }, [pathnameSplitted[2]]);

  const getCurrentHost = async () => {
    try {
      const respond = await call('getCurrentHost');
      setCurrentHost(respond);
      setHue(respond?.settings?.hue);
    } catch (error) {
      console.log(error);
    }
  };

  const getPlatform = async () => {
    try {
      const respond = await call('getPlatform');
      setPlatform(respond);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllHosts = async () => {
    try {
      const respond = await call('getAllHosts');
      setAllHosts(respond.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.log(error);
    }
  };

  const getPageTitles = async () => {
    try {
      const respond = await call('getPageTitles');
      setPageTitles(respond);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getCurrentHost();
    getPlatform();
    getAllHosts();
    getPageTitles();
  }, []);

  const setSelectedHue = async () => {
    try {
      await call('setHostHue', hue);
      // message.success(tc('message.success.update'));
      await getCurrentHost();
    } catch (error) {
      // message.error(error.reason || error.error);
    }
  };

  const chakraTheme = generateTheme(hue);

  const hostWithinUser =
    currentUser &&
    currentUser.memberships &&
    currentUser.memberships.find((membership) => membership.host === window.location.host);

  const role = hostWithinUser && hostWithinUser.role;
  const canCreateContent = role && ['admin', 'contributor'].includes(role);

  const isFederationFooter = platform?.isFederationLayout && platform.footer;
  const isEntryPage = pathnameSplitted[1] !== 'pages' && Boolean(pathnameSplitted[2]);

  return (
    <>
      <HelmetHybrid Host={currentHost} />
      <ChakraProvider theme={chakraTheme}>
        <ColorModeProvider>
          <StateContext.Provider
            value={{
              allHosts,
              canCreateContent,
              currentUser,
              currentHost,
              hue,
              isDesktop,
              isMobile,
              platform,
              role,
              userLoading,
              getCurrentHost,
              getPlatform,
              setHue,
              setSelectedHue,
            }}
          >
            <DummyWrapper>
              {rendered && <TopBarHandler currentUser={currentUser} slideStart={rendered} />}
              <Header Host={currentHost} isLogoSmall={isEntryPage} pageTitles={pageTitles} />
              {children}
            </DummyWrapper>

            <Footer currentHost={currentHost} isFederationFooter={isFederationFooter} tc={tc} />
            {isFederationFooter && <PlatformFooter platform={platform} />}
          </StateContext.Provider>
        </ColorModeProvider>
      </ChakraProvider>
    </>
  );
}

export default withTracker((props) => {
  const meSub = Meteor.isClient && Meteor.subscribe('me');
  const currentUser = Meteor.isClient && Meteor.user();
  const userLoading = meSub && !meSub.ready();

  return {
    currentUser,
    userLoading,
    ...props,
  };
})(LayoutPage);
