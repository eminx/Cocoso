import React, { useContext, useState } from 'react';
import { Button, Center, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import ConfirmModal from '../../../generic/ConfirmModal';
import { call } from '../../../utils/shared';
import { GroupContext } from '../Group';
import { StateContext } from '../../../LayoutContainer';

export default function GroupJoinButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const [t] = useTranslation('groups');
  const { group, getGroupById } = useContext(GroupContext);
  const { currentUser } = useContext(StateContext);

  if (!group) {
    return null;
  }

  const joinGroup = async () => {
    if (!currentUser) {
      // alert('Login first!');
      return;
    }

    try {
      await call('joinGroup', group._id);
      await getGroupById();
      setModalOpen(false);
      // message.success(t('message.added'));
    } catch (error) {
      // message.error(error.error || error.reason);
    }
  };

  return (
    <>
      <Center>
        <Button
          borderColor="green.200"
          borderWidth="2px"
          colorScheme="green"
          height="48px"
          size="lg"
          width="240px"
          onClick={() => setModalOpen(true)}
        >
          {t('actions.join')}
        </Button>
      </Center>

      <ConfirmModal
        visible={modalOpen}
        title={t('modal.join.title')}
        onConfirm={joinGroup}
        onCancel={() => setModalOpen(false)}
        onClose={() => setModalOpen(false)}
      >
        <Text>
          {t('modal.join.body', {
            title: group?.title,
          })}
        </Text>
      </ConfirmModal>
    </>
  );
}
