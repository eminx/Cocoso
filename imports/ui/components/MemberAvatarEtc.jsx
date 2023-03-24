import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import renderHTML from 'react-render-html';

import { getFullName } from '../utils/shared';
import { StateContext } from '../LayoutContainer';
import Popover from '../components/Popover';

function MemberAvatarEtc({ centerItems = false, isThumb = false, hideRole = false, t, user }) {
  const [avatarModal, setAvatarModal] = useState(false);
  const [redirect, setRedirect] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { allHosts, currentHost, isDesktop } = useContext(StateContext);
  const history = useHistory();

  if (!user) {
    return null;
  }

  if (redirect) {
    if (redirect.host === currentHost.host) {
      history.push(`/@${user.username}`);
    } else {
      window.location.href = `https://${redirect.host}/@${user.username}`;
    }
  }

  const { avatar, memberships } = user;
  const avatarSrc = avatar?.src || avatar;

  const membershipsLength = memberships?.length;
  const membershipsWithHosts = memberships?.map((m) => ({
    ...m,
    name: allHosts?.find((h) => h.host === m.host)?.name,
  }));

  const role = memberships?.find((m) => m?.host === currentHost?.host)?.role;
  const roleTr = t(`roles.${role}`);

  return (
    <>
      <Flex
        px="4"
        flexDirection="column"
        align={!centerItems && isDesktop ? 'flex-start' : 'center'}
      >
        <Box pt="4" pb="2">
          {avatarSrc ? (
            <Image
              borderRadius="12px"
              cursor={isThumb ? 'normal' : 'pointer'}
              fit="contain"
              h={isThumb ? '128px' : '200px'}
              src={avatarSrc}
              onClick={!isThumb ? () => setAvatarModal(true) : null}
            />
          ) : (
            <Avatar borderRadius="12px" name={user.username} size="2xl" />
          )}
        </Box>
        <Box>
          <Text fontWeight="bold" fontSize="xl">
            {user.username}{' '}
            {!hideRole && role && (
              <Text as="span" fontSize="sm" fontWeight="light" textTransform="lowercase">
                {roleTr}
              </Text>
            )}
          </Text>
        </Box>
        <Box>
          <Text>{getFullName(user)}</Text>
        </Box>
        {!isThumb && (
          <Box mb="2">
            {membershipsLength > 1 && (
              <Popover
                bg="gray.50"
                placement={!centerItems && isDesktop ? 'bottom-start' : 'bottom'}
                trigger={
                  <Button
                    colorScheme="gray.600"
                    fontWeight="light"
                    textDecoration="underline"
                    variant="link"
                  >
                    {t('profile.message.memberships', { count: membershipsLength })}
                  </Button>
                }
              >
                <Box p="1">
                  {membershipsWithHosts?.map((m) => (
                    <Box key={m.host} my="2">
                      <Button
                        colorScheme="gray.800"
                        textDecoration="underline"
                        variant="link"
                        onClick={() => setRedirect(m)}
                      >
                        {m.name}
                      </Button>
                      <Text
                        as="span"
                        fontSize="sm"
                        fontWeight="light"
                        ml="2"
                        textTransform="lowercase"
                      >
                        {t(`roles.${m.role}`)}
                      </Text>
                    </Box>
                  ))}
                </Box>
              </Popover>
            )}
          </Box>
        )}
      </Flex>

      {!isThumb && (
        <Modal isOpen={isOpen} onClose={onClose} onOpen={onOpen} size="sm" isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{getFullName(user)}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box className="text-content" margin={{ bottom: 'medium' }}>
                {user.contactInfo
                  ? renderHTML(user.contactInfo)
                  : t('message.contact.empty', { username: user.username })}
              </Box>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {avatarSrc && (
        <Modal
          isOpen={avatarModal}
          onClose={() => setAvatarModal(false)}
          onOpen={() => setAvatarModal(false)}
          size="xs"
          isCentered
        >
          <ModalOverlay />
          <ModalContent>
            <Image src={avatarSrc} alt={user.username} fit="contain" />
          </ModalContent>
        </Modal>
      )}
    </>
  );
}

export default MemberAvatarEtc;
