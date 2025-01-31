import React, { useState } from 'react';
import { Box } from '@chakra-ui/react';

import PageHeading from './PageHeading';
import PopupHandler from './PopupHandler';
import InfiniteScroller from './InfiniteScroller';
import NewGridThumb from './NewGridThumb';

export default function ResourcesHybrid({ resources, Host }) {
  const [modalItem, setModalItem] = useState(null);

  const resourcesInMenu = Host?.settings?.menu?.find((item) => item.name === 'resources');
  const description = resourcesInMenu?.description;
  const heading = resourcesInMenu?.label;

  return (
    <>
      <PageHeading description={description} heading={heading} />

      <Box px="2" pb="8">
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
                host={Host?.isPortalHost ? resource.host : null}
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
