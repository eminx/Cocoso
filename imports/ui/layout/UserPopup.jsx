import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  AvatarBadge,
  Badge,
  Box,
  Button,
  Center,
  Link as CLink,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Modal,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';

import { StateContext } from '../LayoutContainer';

function NotificationLinkItem({ host, item, children }) {
  if (item.host && host === item.host) {
    return <Link to={`/${item.context}/${item.contextId}`}>{children}</Link>;
  }

  return (
    <CLink href={`https://${item.host || host}/${item.context}/${item.contextId}`}>
      {children}
    </CLink>
  );
}

const linkButtonProps = {
  as: 'span',
  bg: 'brand.50',
  color: 'brand.500',
  fontWeight: 'normal',
  variant: 'ghost',
  size: 'sm',
};

function UserPopup({ isOpen, setIsOpen }) {
  const [tc] = useTranslation('common');
  const [t] = useTranslation('members');
  const { canCreateContent, currentHost, currentUser, isDesktop, role } = useContext(StateContext);
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <Link to="/login" style={{ marginRight: '12px' }}>
        <Button {...linkButtonProps}>{tc('menu.guest.login')}</Button>
      </Link>
    );
  }

  const handleLogout = () => {
    Meteor.logout();
    navigate('/');
  };

  const handleClickAdmin = () => {
    navigate('/admin/settings');
  };

  const notifications = currentUser?.notifications;

  let notificationsCounter = 0;
  if (notifications && notifications.length > 0) {
    notifications.forEach((notification) => {
      notificationsCounter = notification.count + notificationsCounter;
    });
  }

  const isNotification = notifications && notifications.length > 0;
  const host = currentHost?.host;
  const roleTranslated = t(`roles.${role}`);

  const isAdmin = role === 'admin';

  return (
    <Box>
      <Modal isOpen={isOpen}>
        <ModalOverlay
          zIndex={1}
          onClick={() => {
            setIsOpen(false);
          }}
        />
      </Modal>

      <Menu
        isOpen={isOpen}
        placement="bottom-end"
        onOpen={() => setIsOpen(true)}
        onClose={() => setIsOpen(false)}
      >
        <MenuButton onClick={() => setIsOpen(!isOpen)}>
          <Avatar
            _hover={{ bg: 'brand.500' }}
            bg="brand.600"
            borderRadius="8px"
            showBorder
            size={isDesktop ? 'md' : 'sm'}
            src={currentUser.avatar && currentUser.avatar.src}
          >
            {isNotification && <AvatarBadge borderColor="tomato" bg="tomato" />}
          </Avatar>
        </MenuButton>

        <MenuList>
          <MenuGroup>
            <Box px="4" py="1">
              <Text fontWeight="bold" fontSize="xl">
                {currentUser.username}{' '}
                <Text as="span" fontSize="sm" fontWeight="light" textTransform="lowercase">
                  {roleTranslated}
                </Text>
              </Text>
            </Box>
          </MenuGroup>

          {isAdmin && <MenuDivider />}
          {isAdmin && (
            <MenuItem color="brand.700" px="4" onClick={() => handleClickAdmin()}>
              {/* <Bolt size="20" style={{ marginRight: '6px' }} /> */}
              {t('dashboard')}
            </MenuItem>
          )}
          {isAdmin && <MenuDivider />}

          {isNotification && (
            <MenuGroup title={tc('menu.notifications.label')}>
              <Box px="1">
                {notifications.map((item) => (
                  <NotificationLinkItem key={item.contextId + item.count} host={host} item={item}>
                    <MenuItem>
                      <Text color="brand.700">{item.title} </Text>
                      <Badge colorScheme="red" size="xs">
                        {' '}
                        {item.count}
                      </Badge>
                    </MenuItem>
                  </NotificationLinkItem>
                ))}
              </Box>
            </MenuGroup>
          )}
          {isNotification && <MenuDivider />}

          <MenuGroup>
            <Box px="1">
              <Link to={currentUser && `/@${currentUser?.username}`}>
                <MenuItem as="span" color="brand.700">
                  {tc('menu.member.profile')}
                </MenuItem>
              </Link>
              <Link to={'/edit'}>
                <MenuItem as="span" color="brand.700">
                  {tc('menu.member.settings')}
                </MenuItem>
              </Link>
              {canCreateContent && (
                <Link to="/my-activities">
                  <MenuItem as="span" color="brand.700">
                    {tc('menu.member.activities')}
                  </MenuItem>
                </Link>
              )}
            </Box>
          </MenuGroup>

          <MenuDivider />

          <MenuGroup>
            <Center py="2">
              <Button variant="outline" onClick={() => handleLogout()}>
                {tc('actions.logout')}
              </Button>
            </Center>
          </MenuGroup>
        </MenuList>
      </Menu>
    </Box>
  );
}

export default UserPopup;
