import React, { useState } from 'react';
import { Box, Center } from '@chakra-ui/react';

import PageHeading from './PageHeading';
import PopupHandler from './PopupHandler';
import InfiniteScroller from './InfiniteScroller';
import SexyThumb from './SexyThumb';

export default function GroupsHybrid({ groups, Host }) {
  const [modalItem, setModalItem] = useState(null);

  const groupsInMenu = Host?.settings?.menu?.find((item) => item.name === 'groups');
  const description = groupsInMenu?.description;
  const heading = groupsInMenu?.label;

  return (
    <>
      <PageHeading description={description} heading={heading} />

      <Box px="2" pb="8">
        <InfiniteScroller items={groups}>
          {(item) => (
            <Center key={item._id} flex="1 1 355px" onClick={() => setModalItem(item)}>
              <SexyThumb activity={item} host={Host?.isPortalHost ? item.host : null} />
            </Center>
          )}
        </InfiniteScroller>

        {modalItem && (
          <PopupHandler item={modalItem} kind="groups" onClose={() => setModalItem(null)} />
        )}
      </Box>
    </>
  );
}
