import React, { useState } from 'react';
import { Button, Center, IconButton, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import MessagesSquare from 'lucide-react/dist/esm/icons/messages-square';

import { call } from '../utils/shared';
import Drawer from '../generic/Drawer';
import { Chattery, useChattery } from '../chattery';

export function ChatUI({ context, currentUser, item, open, withInput, setOpen }) {
  const [tc] = useTranslation('common');
  const { discussion } = item && useChattery(item._id);

  if (!item) {
    return null;
  }

  const addNewChatMessage = async (messageContent) => {
    const values = {
      context,
      contextId: item._id,
      message: messageContent,
    };

    try {
      await call('addChatMessage', values);
    } catch (error) {
      console.log('error', error);
    }
  };

  const removeNotification = async (messageIndex) => {
    const shouldRun = currentUser?.notifications?.find((notification) => {
      if (!notification.unSeenIndexes) {
        return false;
      }
      return notification.unSeenIndexes.some((unSeenIndex) => unSeenIndex === messageIndex);
    });

    if (!shouldRun) {
      return;
    }

    try {
      await call('removeNotification', item._id, messageIndex);
    } catch (error) {
      // console.log('error', error);
    }
  };

  return (
    <Drawer isOpen={open} title={tc('labels.discussion')} onClose={() => setOpen(false)}>
      <Chattery
        messages={discussion}
        onNewMessage={addNewChatMessage}
        removeNotification={removeNotification}
        withInput={withInput}
      />
    </Drawer>
  );
}

export function ChatButton({ context, currentUser, item, withInput }) {
  const [open, setOpen] = useState(false);
  const [tc] = useTranslation('common');

  const props = { context, currentUser, item, open, withInput, setOpen };

  return (
    <>
      <Center>
        <VStack spacing="0">
          <IconButton
            _hover={{ bg: 'brand.200' }}
            _active={{ bg: 'brand.200' }}
            bg="brand.100"
            border="1px solid"
            borderColor="brand.300"
            fontSize="32px"
            icon={<MessagesSquare />}
            isRound
            variant="ghost"
            onClick={() => setOpen(true)}
          />
          <Button
            color="brand.50"
            fontWeight="normal"
            size="xs"
            variant="link"
            onClick={() => setOpen(true)}
          >
            {tc('labels.discussion')}
          </Button>
        </VStack>
      </Center>
      {open && <ChatUI {...props} />}
    </>
  );
}
