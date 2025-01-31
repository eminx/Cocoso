import React, { useState } from 'react';
import { Box, Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import Tabs from '../entry/Tabs';
import PageHeading from './PageHeading';
import PopupHandler from './PopupHandler';
import InfiniteScroller from './InfiniteScroller';
import SexyThumb from './SexyThumb';

export default function ActivitiesHybrid({ activities, Host, showPast }) {
  const [modalItem, setModalItem] = useState(null);
  const [tc] = useTranslation('common');

  const activitiesInMenu = Host?.settings?.menu?.find((item) => item.name === 'activities');
  const description = activitiesInMenu?.description;
  const heading = activitiesInMenu?.label;

  const tabs = [
    {
      path: '/activities?showPast=true',
      title: tc('labels.past'),
    },
    {
      path: '/activities',
      title: tc('labels.upcoming'),
    },
  ];

  return (
    <>
      <PageHeading description={description} heading={heading} />
      <Center pb="4">
        <Tabs tabs={tabs} index={showPast ? 0 : 1} />
      </Center>

      <Box px="2" pb="8">
        <InfiniteScroller items={activities}>
          {(item) => (
            <Center key={item._id} flex="1 1 355px" onClick={() => setModalItem(item)}>
              <SexyThumb
                activity={item}
                host={Host?.isPortalHost ? item.host : null}
                showPast={showPast}
              />
            </Center>
          )}
        </InfiniteScroller>

        {modalItem && (
          <PopupHandler item={modalItem} kind="activities" onClose={() => setModalItem(null)} />
        )}
      </Box>
    </>
  );
}
