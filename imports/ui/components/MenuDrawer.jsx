import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Center, Flex, Heading, IconButton, Text, VStack } from '@chakra-ui/react';
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
        <Box bg="brand.100" position="fixed" top="0" w="72px" h="56px">
          <Center cursor="pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Text color="brand.500" fontSize="36px" fontWeight="bold">
              {platform?.name?.substring(0, 1)?.toUpperCase()}
            </Text>
          </Center>
        </Box>
        <Box
          bg="brand.700"
          className={menuClassName}
          color="brand.100"
          h="100vh"
          px="2"
          position="fixed"
        >
          {!isOpen ? (
            <Center pt="4">
              <Flex flexDirection="column" align="center">
                <IconButton
                  _hover={{ bg: 'brand.600' }}
                  bg="brand.700"
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
                    currentHost={currentHost}
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
            bg: 'brand.600',
          }}
          bg="brand.500"
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
          <MenuContent
            currentHost={currentHost}
            menuItems={menuItems}
            platform={platform}
            tc={tc}
            onToggle={onToggle}
          />
          <Box color="brand.100" mt="4">
            <MenuFooter />
          </Box>
        </Flex>
      </Drawer>
    </Box>
  );
}

function MenuContent({ currentHost, menuItems, platform, tc, onToggle }) {
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
      <Text color="brand.50" fontSize="xs" mt="2">
        <em>{currentHost?.settings?.name}</em>
      </Text>

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
      <Box pt="8">
        {showPlatformItems && (
          <Text color="brand.50" fontSize="xs" mb="2">
            <em>{platform?.name}</em>
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
      </Box>
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
