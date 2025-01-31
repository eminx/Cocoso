import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Heading,
  HStack,
  Image,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Tag,
  TagLabel,
  Text,
} from '@chakra-ui/react';

import { StateContext } from '../../LayoutContainer';
import NiceList from '../../generic/NiceList';
import Template from '../../layout/Template';
import Loader from '../../generic/Loader';
import { Alert } from '../../generic/message';

const focusStyle = {
  boxShadow: 'none',
};

function Activities({ history }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useContext(StateContext);

  const [t] = useTranslation('activities');
  const [tm] = useTranslation('members');
  const [tc] = useTranslation('common');

  useEffect(() => {
    Meteor.call('getMyActivities', (error, respond) => {
      if (error) {
        setLoading(false);
        return;
      }
      setActivities(respond.reverse());
      setLoading(false);
    });
  }, []);

  if (loading || !activities) {
    return <Loader />;
  }

  return (
    <>
      <Template heading={tc('menu.member.activities')}>
        {currentUser && activities ? (
          <Tabs>
            <TabList>
              <Tab _focus={focusStyle}>{t('members.tabs.all')}</Tab>
              <Tab _focus={focusStyle}>{t('members.tabs.public')}</Tab>
              <Tab _focus={focusStyle}>{t('members.tabs.private')}</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px="0">
                <NiceList actionsDisabled list={activities}>
                  {(act) => (
                    <Link to={`/activities/${act._id}/info`}>
                      <ActivityItem act={act} />
                    </Link>
                  )}
                </NiceList>
              </TabPanel>
              <TabPanel px="0">
                <NiceList actionsDisabled list={activities.filter((act) => act.isPublicActivity)}>
                  {(act) => (
                    <Link to={`/activities/${act._id}/info`}>
                      <ActivityItem act={act} history={history} />
                    </Link>
                  )}
                </NiceList>
              </TabPanel>
              <TabPanel px="0">
                <NiceList actionsDisabled list={activities.filter((act) => !act.isPublicActivity)}>
                  {(act) => <ActivityItem act={act} history={history} />}
                </NiceList>
              </TabPanel>
            </TabPanels>
          </Tabs>
        ) : (
          <Alert margin="medium" message={tm('message.guest')} />
        )}
      </Template>
    </>
  );
}

const ActivityItem = ({ act }) => {
  const [t] = useTranslation('activities');

  return (
    <HStack align="flex-start" bg="white" p="3" w="100%">
      {act.isPublicActivity && (
        <Box p="2">
          <Image fit="cover" w="xs" fill src={act.imageUrl} />
        </Box>
      )}
      <Box w="100%">
        <Heading mb="2" overflowWrap="anywhere" size="md">
          {act.title}
        </Heading>
        <Tag>
          <TagLabel>{act.resource}</TagLabel>
        </Tag>
        <Text fontWeight="light">{act.subTitle}</Text>
        <Text fontStyle="italic" p="1" textAlign="right">
          {act.datesAndTimes.length} {t('members.occurences')}
        </Text>
      </Box>
    </HStack>
  );
};

export default Activities;
