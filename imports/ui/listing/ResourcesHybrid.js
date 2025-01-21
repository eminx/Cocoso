import React, { useState } from 'react';
import { Box } from '@chakra-ui/react';

import PageHeading from '../components/PageHeading';
import PopupHandler from './PopupHandler';
import InfiniteScroller from '../components/InfiniteScroller';
import NewGridThumb from '../components/NewGridThumb';

export default function ResourcesHybrid({ resources, Host }) {
  const [modalItem, setModalItem] = useState(null);

  const resourcesInMenu = Host?.settings?.menu?.find((item) => item.name === 'resources');
  const description = resourcesInMenu?.description;
  const heading = resourcesInMenu?.label;

  return (
    <>
      <PageHeading description={description} heading={heading} />

      <Box px="2">
        <InfiniteScroller isMasonry items={resources}>
          {(resource) => (
            <Box
              key={resource._id}
              borderRadius="8px"
              cursor="pointer"
              mb="2"
              onClick={() => setModalItem(resource)}
            >
              <NewGridThumb
                fixedImageHeight
                // host={isPortalHost ? allHosts.find((h) => h.host === resource.host)?.name : null}
                imageUrl={resource.images?.[0]}
                title={resource.label}
              />
            </Box>
          )}
        </InfiniteScroller>

        {modalItem && (
          <PopupHandler item={modalItem} kind="resources" onClose={() => setModalItem(null)} />
        )}
      </Box>
    </>
  );
}