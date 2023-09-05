import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Center, Divider, Flex, Heading, IconButton, Text, VStack } from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { useTranslation } from 'react-i18next';

import Drawer from './Drawer';
import ChangeLanguageMenu from './ChangeLanguageMenu';

const getRoute = (item, index) => {
  if (item.name === 'info') {
    return '/pages/about';
  }
  return `/${item.name}`;
};

export default function MenuDrawer({ currentHost, isDesktop, platform }) {
  const [isOpen, setIsOpen] = useState(false);
  const [tc] = useTranslation('common');

  const { menu } = currentHost?.settings;

  const menuItems = menu
    .filter((item) => item.isVisible)
    .map((item, index) => ({
      ...item,
      route: getRoute(item, index),
    }));

  const onToggle = () => setIsOpen(!isOpen);

  let menuClassName = 'menu-drawer';
  if (isOpen) {
    menuClassName += ' menu-drawer--open';
  }

  if (isDesktop) {
    return (
      <Box className={menuClassName} position="relative" flexGrow="0" flexShrink="0">
        <Box
          bg="brand.800"
          className={menuClassName}
          color="brand.100"
          h="100vh"
          p="2"
          position="fixed"
        >
          {!isOpen ? (
            <Center pt="4">
              <Flex flexDirection="column" align="center">
                <IconButton
                  _hover={{ bg: 'brand.600' }}
                  bg="brand.800"
                  color="brand.50"
                  icon={<HamburgerIcon fontSize="36px" />}
                  onClick={onToggle}
                />
                <Text fontSize="xs" fontWeight="bold" textTransform="uppercase">
                  {tc('menu.label')}
                </Text>
              </Flex>
            </Center>
          ) : (
            <Flex flexDirection="column" h="100%" justify="space-between" overflowY="auto">
              <Box pt="4">
                <Flex align="flex-start" justify="space-between">
                  <Heading fontSize="24px" px="4" mt="2">
                    {tc('menu.label')}
                  </Heading>
                  <IconButton
                    _hover={{ bg: 'brand.600' }}
                    bg="brand.800"
                    color="brand.50"
                    icon={<CloseIcon />}
                    mr="4"
                    onClick={onToggle}
                  />
                </Flex>

                <Box p="4">
                  <MenuContent
                    menuItems={menuItems}
                    platform={platform}
                    tc={tc}
                    onToggle={onToggle}
                  />
                </Box>
              </Box>
              <Box color="brand.50" pl="4">
                <MenuFooter />
              </Box>
            </Flex>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Flex align="center" flexDirection="column" position="relative">
        <IconButton
          _hover={{
            bg: 'brand.500',
          }}
          bg="brand.600"
          icon={<HamburgerIcon fontSize="32px" />}
          w="44px"
          h="44px"
          onClick={onToggle}
        />
        <Text
          fontSize="12px"
          fontWeight="bold"
          position="absolute"
          top="2.8rem"
          textTransform="uppercase"
        >
          {tc('menu.label')}
        </Text>
      </Flex>

      <Drawer
        bg="brand.800"
        isOpen={isOpen}
        placement="right"
        title={tc('menu.label')}
        titleColor="brand.50"
        onClose={onToggle}
      >
        <Flex flexDirection="column" h="100%" justify="space-between">
          <MenuContent menuItems={menuItems} platform={platform} tc={tc} onToggle={onToggle} />
          <Box color="brand.100" mt="4">
            <MenuFooter />
          </Box>
        </Flex>
      </Drawer>
    </Box>
  );
}

function MenuContent({ menuItems, platform, tc, onToggle }) {
  const location = useLocation();
  const { pathname } = location;

  const isCurrentPage = (item) => {
    if (item.name === 'info') {
      const pathSplitted = pathname.split('/');
      return pathSplitted && pathSplitted[1] === 'pages';
    }
    return item.route === pathname;
  };

  const showPlatformItems = platform?.showCommunitiesInMenu;

  return (
    <VStack align="flex-start">
      <Divider borderColor="gray.400" mb="2" />
      {menuItems.map((item) => {
        const isCurrentPageLabel = isCurrentPage(item);
        return (
          <Link key={item.label} style={{ textShadow: 'none' }} to={item.route} onClick={onToggle}>
            <Box py="1">
              <Text
                _hover={!isCurrentPageLabel && { textDecoration: 'underline' }}
                color={isCurrentPageLabel ? 'brand.50' : 'brand.100'}
                fontWeight={isCurrentPageLabel ? 'bold' : 'normal'}
              >
                {item.label}
              </Text>
            </Box>
          </Link>
        );
      })}
      {showPlatformItems && (
        <Divider
          borderColor="gray.400"
          my="4"
          style={{ marginTop: '1rem', marginBottom: '0.5rem' }}
        />
      )}
      {showPlatformItems && (
        <Text color="brand.50" fontSize="xs">
          <em>{tc('domains.platform', { platform: platform?.name })}</em>
        </Text>
      )}
      {showPlatformItems && (
        <Link
          key="/communities"
          style={{ textShadow: 'none' }}
          to="/communities"
          onClick={onToggle}
        >
          <Box py="1">
            <Text
              _hover={{ textDecoration: 'underline' }}
              color="brand.50"
              fontWeight={pathname === '/communities' ? 'bold' : 'normal'}
            >
              {tc('platform.communities')}
            </Text>
          </Box>
        </Link>
      )}
    </VStack>
  );
}

function MenuFooter() {
  return (
    <Box pb="4">
      <ChangeLanguageMenu />
    </Box>
  );
}
