import React, { useContext, useEffect, useState } from 'react';
import { Link, Redirect, Route, Switch } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Center, Flex, Grid, GridItem, Link as CLink, Text } from '@chakra-ui/react';
import renderHTML from 'react-render-html';

import { StateContext } from '../../LayoutContainer';
import Loader from '../../components/Loader';
import { Alert } from '../../components/message';
import MemberAvatarEtc from '../../components/MemberAvatarEtc';
import MemberWorks from '../works/MemberWorks';
import MemberActivities from '../activities/MemberActivities';
import MemberProcesses from '../processes/MemberProcesses';
import Tabs from '../../components/Tabs';
import { call } from '../../utils/shared';
import NewEntryHelper from '../../components/NewEntryHelper';
import SexyThumb from '../../components/SexyThumb';
import BackLink from '../../components/BackLink';

function Profile({ history, match, path }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [user, setUser] = useState(null);
  const [t] = useTranslation('members');
  const [tc] = useTranslation('common');
  const [ta] = useTranslation('accounts');
  const { username } = match.params;
  const { currentUser, currentHost, isDesktop, platform } = useContext(StateContext);

  useEffect(() => {
    getUserInfo();
  }, [username]);

  const getUserInfo = async () => {
    try {
      const respond = await call('getUserInfo', username);
      setUser(respond);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(true);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error || !user) {
    return (
      <Center p="8">
        <Alert message={ta('profile.message.notfound')} />
      </Center>
    );
  }

  // const setAsParticipant = async (user) => {
  //   try {
  //     await call('setAsParticipant', user.id);
  //     message.success(`${user.username} is now set back as a participant`);
  //   } catch (error) {
  //     console.log(error);
  //     message.error(error.reason || error.error);
  //   }
  // };

  // const setAsContributor = async (user) => {
  //   try {
  //     await call('setAsContributor', user.id);
  //     message.success(`${user.username} is now set as a cocreator`);
  //   } catch (error) {
  //     console.log(error);
  //     message.error(error.reason || error.error);
  //   }
  // };

  const { menu } = currentHost?.settings;

  const tabs = [];

  if (!isDesktop) {
    tabs.push({
      path: `/@${username}/bio`,
      title: tc('domains.bio'),
      isVisible: true,
    });
  }

  menu
    ?.filter((item) => {
      return ['works', 'activities', 'processes'].includes(item.name) && item.isVisible;
    })
    ?.forEach((item) => {
      tabs.push({
        path: `/@${username}/${item.name}`,
        title: item.label,
      });
    });

  tabs.push({
    path: `/@${username}/contact`,
    title: tc('labels.contact'),
  });

  if (currentUser && currentUser.username === username) {
    tabs.push({
      path: `/@${username}/edit`,
      title: <b>{tc('actions.update')}</b>,
    });
  }

  const tabIndex = tabs.findIndex((tab) => tab.path === history?.location?.pathname);

  if (tabs && !tabs.find((tab) => tab.path === history?.location?.pathname)) {
    return <Redirect to={tabs[0].path} />;
  }

  const isSelfAccount = currentUser && currentUser.username === username;

  const isFederationLayout = platform?.isFederationLayout;

  const members = menu?.find((item) => item.name === 'members');

  return (
    <>
      <Box p="2">
        <BackLink backLink={{ label: members.label, value: '/members' }} />
      </Box>
      {/* <Grid templateColumns={isDesktop ? '3fr 4fr 1fr' : '1fr'}> */}
      {/* <GridItem mx={isDesktop ? '4' : '0'} mt="2" mb="4"> */}
      <Center>
        <Box>
          <MemberAvatarEtc centerItems t={t} tc={tc} user={user} />
          {isDesktop && <Bio isDesktop isSelfAccount={isSelfAccount} tc={tc} user={user} />}
        </Box>
      </Center>
      {/* </GridItem> */}

      {/* <GridItem pl={isDesktop ? '12' : '0'}> */}
      <Center>
        <Box maxW="600px">
          <Tabs align="center" index={tabIndex} tabs={tabs} px="4" />

          <Box pt="4" px={isDesktop ? '4' : '0'}>
            <Switch path={path} history={history}>
              {!isDesktop && (
                <Route
                  path="/@:username/bio"
                  render={(props) => (
                    <Bio isDesktop={false} isSelfAccount={isSelfAccount} tc={tc} user={user} />
                  )}
                />
              )}
              <Route
                path="/@:username/activities"
                render={(props) => (
                  <MemberActivities
                    currentHost={currentHost}
                    isDesktop={isDesktop}
                    isFederationLayout={isFederationLayout}
                    isSelfAccount={isSelfAccount}
                    user={user}
                  />
                )}
              />
              <Route
                path="/@:username/processes"
                render={(props) => (
                  <MemberProcesses
                    currentHost={currentHost}
                    isDesktop={isDesktop}
                    isFederationLayout={isFederationLayout}
                    isSelfAccount={isSelfAccount}
                    user={user}
                  />
                )}
              />
              <Route
                path="/@:username/works"
                render={(props) => (
                  <MemberWorks
                    currentHost={currentHost}
                    isDesktop={isDesktop}
                    isFederationLayout={isFederationLayout}
                    isSelfAccount={isSelfAccount}
                    user={user}
                  />
                )}
              />
              <Route
                path="/@:username/contact"
                render={(props) => (
                  <ContactInfo
                    isDesktop={false}
                    isSelfAccount={isSelfAccount}
                    tc={tc}
                    user={user}
                  />
                )}
              />
            </Switch>
          </Box>
        </Box>
      </Center>
      {/* </GridItem> */}
      {/* </Grid> */}
    </>
  );
}

function stripHtml(html) {
  let tmp = document.createElement('DIV');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

function Bio({ isDesktop, isSelfAccount, tc, user }) {
  if (!user || !user.bio) {
    return null;
  }

  const bareBio = stripHtml(user.bio);

  if (isSelfAccount && (!bareBio || bareBio.length < 2)) {
    return (
      <Link to={`/@${user?.username}/edit`}>
        <Box p="4" mb="4">
          <SexyThumb
            subTitle={tc('menu.member.settings')}
            title={tc('message.newentryhelper.bio.title')}
          />
        </Box>
      </Link>
    );
  }

  if (!bareBio || bareBio.length < 2) {
    return null;
  }

  return (
    <Flex justifyContent={isDesktop ? 'flex-start' : 'center'} mb="4">
      <Box
        bg="white"
        className="text-content"
        maxW="480px"
        px="4"
        py="2"
        textAlign="center"
        w="100%"
      >
        {renderHTML(user.bio)}
      </Box>
    </Flex>
  );
}

function ContactInfo({ isDesktop, isSelfAccount, tc, user }) {
  if (!user || !user.contactInfo) {
    return null;
  }

  const bareContactInfo = stripHtml(user.contactInfo);

  if (isSelfAccount && (!bareContactInfo || bareContactInfo.length < 3)) {
    return (
      <NewEntryHelper
        title={tc('message.newentryhelper.contactInfo.title')}
        buttonLabel={tc('menu.member.settings')}
        buttonLink={`/@${user?.username}/edit`}
      >
        {tc('message.newentryhelper.contactInfo.description')}
      </NewEntryHelper>
    );
  }

  return (
    <Flex justifyContent={isDesktop ? 'flex-start' : 'center'}>
      <Box maxWidth="480px" className="text-content" p="4">
        {renderHTML(user.contactInfo)}
      </Box>
    </Flex>
  );
}

export default Profile;
