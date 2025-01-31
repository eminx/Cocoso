import React from 'react';
import { Avatar, Box, Center, Tag, Text, Wrap, WrapItem } from '@chakra-ui/react';

import { getFullName } from '../utils/shared';

const tagProps = {
  bg: 'white',
  borderRadius: '0',
  border: '1px solid',
  borderColor: 'brand.500',
};

function MemberAvatarEtc({ isThumb = true, user }) {
  const { avatar } = user;
  const avatarSrc = avatar?.src || avatar;

  return (
    <Box mb="6">
      <Center>
        <Avatar
          borderRadius="8px"
          maxW={350}
          name={user.username}
          showBorder
          size={!avatarSrc || isThumb ? '2xl' : '4xl'}
          src={avatarSrc}
        />
      </Center>

      <Box>
        <Center>
          <Text fontWeight="bold" fontSize="xl">
            {user.username}
          </Text>
        </Center>
        <Center mb="4">
          <Text>{getFullName(user)}</Text>
        </Center>

        {!isThumb && user.keywords && (
          <Wrap justify="center" py="2">
            {user.keywords?.map((k) => (
              <WrapItem key={k.keywordId}>
                <Tag {...tagProps}>{k.keywordLabel}</Tag>
              </WrapItem>
            ))}
          </Wrap>
        )}
      </Box>
    </Box>
  );
}

export default MemberAvatarEtc;
