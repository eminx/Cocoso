import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Center, Flex, Heading, Link as CLink, List, ListItem, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import parseHtml from 'html-react-parser';

import FeedbackForm from './FeedbackForm';
import ChangeLanguageMenu from './ChangeLanguageMenu';

export function OldFooter({ host, settings }) {
  return (
    <Box textAlign="center" p="4" fontSize="85%">
      <Text fontSize="sm">
        {settings?.address}
        {', '} {settings?.city}
      </Text>
      <Text fontSize="sm">{settings?.email}</Text>
      <Text fontSize="sm" fontWeight="bold">
        {host}
      </Text>
    </Box>
  );
}

export function Footer({ currentHost, isFederationFooter, tc }) {
  if (!currentHost || !currentHost.settings) {
    return null;
  }

  const activeMenu = currentHost.settings?.menu?.filter((item) => item.isVisible);
  const { settings } = currentHost;

  return (
    <Box bg="gray.200" color="brand.900" w="100%">
      <Center p="4">
        <List direction="row" display="flex" flexWrap="wrap" justifyContent="center">
          {activeMenu.map((item) => (
            <ListItem key={item.name} px="4" py="2">
              <Link to={item.name === 'info' ? '/pages/about' : `/${item.name}`}>
                <CLink as="span" color="brand.500" fontWeight="bold">
                  {item.label}
                </CLink>{' '}
              </Link>
            </ListItem>
          ))}
        </List>
      </Center>

      {!currentHost.isPortalHost && (
        <Center pt="2">
          <Flex direction="column" justify="center" textAlign="center">
            <Heading size="md">{settings.name}</Heading>
            <Center>
              {settings.footer ? (
                <Box
                  className="text-content"
                  fontSize="85%"
                  maxWidth="480px"
                  mt="4"
                  textAlign="center"
                  w="100%"
                >
                  {parseHtml(settings?.footer)}
                </Box>
              ) : (
                <OldFooter host={currentHost.host} settings={settings} />
              )}
            </Center>
            {!isFederationFooter && (
              <>
                <Box>
                  <Link to="/terms-&-privacy-policy">
                    <CLink as="span" fontSize="xs">
                      {tc('terms.title')}{' '}
                    </CLink>
                  </Link>
                </Box>
                <FeedbackForm />
              </>
            )}
          </Flex>
        </Center>
      )}
      <Center p="4">
        <ChangeLanguageMenu isCentered />
      </Center>
    </Box>
  );
}

export function PlatformFooter({ platform, children }) {
  const [tc] = useTranslation('common');
  if (!platform) {
    return null;
  }
  return (
    <Center bg="black" className="platform-footer">
      <Box color="white" fontSize="85%" maxW="480px" py="4" textAlign="center">
        <Box p="4">
          <a href={`https://${platform?.portalHost}`}>
            <Heading color="white" size="md">
              {platform.name}
            </Heading>
          </a>
        </Box>

        <Box p="2" className="text-content">
          {parseHtml(platform.footer)}
        </Box>
        <Box p="2">{children}</Box>

        <Box>
          <Link to="/terms-&-privacy-policy">
            <CLink as="span" color="brand.50" fontSize="xs">
              {tc('terms.title')}{' '}
            </CLink>
          </Link>
        </Box>
        <FeedbackForm isDarkText={false} />
      </Box>
    </Center>
  );
}
