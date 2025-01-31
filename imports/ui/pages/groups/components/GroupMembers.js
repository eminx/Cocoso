import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, AvatarGroup, Box, Flex, Link as CLink, Text } from '@chakra-ui/react';

import Modal from '../../../generic/Modal';
import NiceList from '../../../generic/NiceList';

export default function GroupMembers({ group }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [t] = useTranslation('groups');

  if (!group) {
    return null;
  }

  return (
    <Box>
      <AvatarGroup
        _hover={{ bg: 'gray.200', borderRadius: '8px' }}
        cursor="pointer"
        max={6}
        p="2"
        size="lg"
        spacing="-1.5rem"
        onClick={() => setModalOpen(true)}
      >
        {group.members?.map((member) => (
          <Avatar key={member.memberId} name={member.username} showBorder src={member.avatar} />
        ))}
      </AvatarGroup>

      <Modal
        isCentered
        isOpen={modalOpen}
        title={t('labels.member')}
        onClose={() => setModalOpen(false)}
        onCancel={() => setModalOpen(false)}
      >
        <NiceList keySelector="username" list={group.members} py="4" spacing="4">
          {(member) => (
            <Link to={`/@${member.username}/bio`}>
              <Flex align="center">
                <Avatar
                  borderRadius="8px"
                  mr="2"
                  name={member.username}
                  size="md"
                  src={member.avatar}
                />
                <CLink as="span" fontWeight={member.isAdmin ? 700 : 400}>
                  {member.username}
                </CLink>
                <Text ml="1">{member.isAdmin && '(admin)'}</Text>
              </Flex>
            </Link>
          )}
        </NiceList>
      </Modal>
    </Box>
  );
}
