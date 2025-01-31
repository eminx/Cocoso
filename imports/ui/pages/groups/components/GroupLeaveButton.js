import React, { useContext, useState } from 'react';
import { Button, Center, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import ConfirmModal from '../../../generic/ConfirmModal';
import { call } from '../../../utils/shared';
import { GroupContext } from '../Group';
import { StateContext } from '../../../LayoutContainer';

export default function LeaveButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const [t] = useTranslation('groups');
  const { group, getGroupById } = useContext(GroupContext);
  const { currentUser } = useContext(StateContext);

  if (!group || !currentUser) {
    return null;
  }

  const leaveGroup = async () => {
    try {
      await call('leaveGroup', group._id);
      getGroupById();
      // message.success(t('message.removed'));
    } catch (error) {
      // message.error(error.error || error.reason);
    }
  };

  return (
    <>
      <Center>
        <Button colorScheme="red" variant="link" onClick={() => setModalOpen(true)}>
          {t('actions.leave')}
        </Button>
      </Center>

      <ConfirmModal
        visible={modalOpen}
        title={t('modal.leave.title')}
        onConfirm={leaveGroup}
        onCancel={() => setModalOpen(false)}
        onClose={() => setModalOpen(false)}
      >
        <Text>
          {t('modal.leave.body', {
            title: group?.title,
          })}
        </Text>
      </ConfirmModal>
    </>
  );
}
