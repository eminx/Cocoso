import React, { useContext } from 'react';
import { Box } from '@chakra-ui/react';

import { StateContext } from '../../../LayoutContainer';
import { ActivityContext } from '../Activity';
import RsvpHandler from './RsvpHandler';
import SlideWidget from '../../../entry/SlideWidget';
import ActivityAdminFunctions from './ActivityAdminFunctions';
import { ChatButton } from '../../../chattery/ChatHandler';

export default function ActivityInteractionHandler({ slideStart }) {
  const { canCreateContent, currentUser, role } = useContext(StateContext);
  const { activity } = useContext(ActivityContext);

  if (!activity) {
    return null;
  }

  if (currentUser && (role === 'admin' || activity.authorId === currentUser._id)) {
    return (
      <SlideWidget justify="space-between" slideStart={slideStart}>
        <ActivityAdminFunctions />
        <RsvpHandler activity={activity} />
        <ChatButton context="activities" currentUser={currentUser} item={activity} withInputs />
      </SlideWidget>
    );
  }

  if (currentUser && canCreateContent) {
    return (
      <SlideWidget justify="space-between" slideStart={slideStart}>
        <Box />
        <RsvpHandler activity={activity} />
        <ChatButton context="activities" currentUser={currentUser} item={activity} withInputs />
      </SlideWidget>
    );
  }

  return (
    <SlideWidget slideStart={slideStart}>
      <RsvpHandler activity={activity} />
    </SlideWidget>
  );
}
