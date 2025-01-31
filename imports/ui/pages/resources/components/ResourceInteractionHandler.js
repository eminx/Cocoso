import React, { useContext } from 'react';
import { Box } from '@chakra-ui/react';

import { StateContext } from '../../../LayoutContainer';
import { ResourceContext } from '../Resource';
import { ChatButton } from '../../../chattery/ChatHandler';
import SlideWidget from '../../../entry/SlideWidget';

export default function ResourceInteractionHandler({ slideStart }) {
  const { canCreateContent, currentUser } = useContext(StateContext);
  const { resource } = useContext(ResourceContext);

  const isVerifiedUser = currentUser && canCreateContent;

  if (isVerifiedUser) {
    return (
      <SlideWidget justify="space-between" slideStart={slideStart}>
        <Box />
        <Box>
          <ChatButton context="resources" currentUser={currentUser} item={resource} withInput />
        </Box>
      </SlideWidget>
    );
  }
}
