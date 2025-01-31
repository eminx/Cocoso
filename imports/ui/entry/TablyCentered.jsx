import React, { useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Link as CLink,
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  VStack,
  Wrap,
} from '@chakra-ui/react';
import LinkIcon from 'lucide-react/dist/esm/icons/link';
import SettingsIcon from 'lucide-react/dist/esm/icons/settings';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet';

import NiceSlider from '../generic/NiceSlider';
import Tabs from './Tabs';
import BackLink from './BackLink';

function AvatarHolder({ author }) {
  if (!author) {
    return null;
  }
  return (
    <Box>
      <Link to={`/@${author.username}/`}>
        <VStack _hover={{ textDecoration: 'underline' }} justify="center" spacing="0">
          <Avatar
            borderRadius="8px"
            elevation="medium"
            name={author.username}
            showBorder
            src={author.src}
          />
          <CLink as="span" color="brand.500">
            {author.username}
          </CLink>
        </VStack>
      </Link>
    </Box>
  );
}

function Header({ author, backLink, subTitle, tags, tc, title }) {
  const [copied, setCopied] = useState(false);
  const location = useLocation();

  const handleCopyLink = async () => {
    const host = window?.location?.host;
    try {
      await navigator.clipboard.writeText(`https://${host}${location.pathname}`);
      setCopied(true);
    } catch (error) {
      console.log(error);
    }
  };

  const renderTitles = () => (
    <Center>
      <Flex p="4" justify={author ? 'space-between' : 'center'} w="100%">
        {author && <Box w="48px" />}
        <Box>
          <Heading
            as="h1"
            lineHeight={1}
            my="2"
            size="lg"
            textAlign={author ? 'left' : 'center'}
            textShadow="1px 1px 1px #fff"
          >
            {title}
          </Heading>
          {subTitle && (
            <Heading
              as="h2"
              size="md"
              fontWeight="400"
              lineHeight={1}
              my="2"
              textAlign={author ? 'left' : 'center'}
            >
              {subTitle}
            </Heading>
          )}
          {tags && tags.length > 0 && (
            <Wrap flexGrow="0" justify="center" mt="4">
              {tags.map(
                (tag) =>
                  tag && (
                    <Badge key={tag} bg="gray.50" color="gray.800" fontSize="14px">
                      {tag}
                    </Badge>
                  )
              )}
            </Wrap>
          )}
        </Box>
        {author && <AvatarHolder author={author} />}
      </Flex>
    </Center>
  );

  return (
    <Box mb="4" w="100%">
      <Flex alignContent="flex-start" justify="space-between">
        <Box flexGrow={0} flexShrink={0} pl="2" width="150px">
          {backLink && <BackLink backLink={backLink} />}
        </Box>

        <Button
          leftIcon={<LinkIcon size={18} />}
          mr="2"
          variant="link"
          onClick={() => handleCopyLink()}
        >
          {copied ? tc('actions.copied') : tc('actions.share')}
        </Button>
      </Flex>
      {renderTitles()}
    </Box>
  );
}

function AdminMenu({ adminMenu }) {
  if (!adminMenu || !adminMenu.label || !adminMenu.items) {
    return null;
  }

  return (
    <Menu direction="rtl" placement="bottom-end">
      <MenuButton color="brand.500" fontSize="md" px="4" pb="2">
        <SettingsIcon />
      </MenuButton>
      <MenuList>
        {adminMenu.items.map((item) =>
          item.link ? (
            <Link to={item.link} key={item.label}>
              <MenuItem>{item.label}</MenuItem>
            </Link>
          ) : (
            <MenuItem key={item.label} onClick={item.onClick}>
              {item.label}
            </MenuItem>
          )
        )}
      </MenuList>
    </Menu>
  );
}

function TablyCentered({
  action = null,
  adminMenu = null,
  author = null,
  backLink,
  content,
  images,
  subTitle,
  tabs,
  title,
  tags = null,
}) {
  const location = useLocation();
  const [tc] = useTranslation('common');

  const pathnameLastPart = location.pathname.split('/').pop();
  const tabIndex = tabs && tabs.findIndex((tab) => tab.path === pathnameLastPart);

  const description = subTitle || content || author?.username;
  const imageUrl = images && images[0];

  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{title}</title>
        <meta name="title" content={title} />
        <meta name="description" content={description?.substring(0, 150)} />
        <meta property="og:title" content={title?.substring(0, 30)} />
        <meta property="og:description" content={description?.substring(0, 60)} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:type" content="article" />
      </Helmet>

      <Center w="100%">
        <Box w="100%">
          <Box>
            <Header
              author={author}
              backLink={backLink}
              subTitle={subTitle}
              tags={tags}
              tc={tc}
              title={title}
            />

            {images && (
              <Center py="2">
                <NiceSlider alt={title} images={images} />
              </Center>
            )}

            {action && <Box>{action}</Box>}
          </Box>

          <Center>
            <Box maxW="540px" w="100%">
              <Box w="100%">
                {tabs && (
                  <Tabs
                    align="center"
                    colorScheme="gray.800"
                    index={tabIndex}
                    mt="2"
                    mb="1"
                    tabs={tabs}
                  >
                    {adminMenu && <AdminMenu adminMenu={adminMenu} />}
                  </Tabs>
                )}

                <Box mb="24">
                  {tabs ? (
                    <Routes>
                      {tabs.map((tab) => (
                        <Route key={tab.title} path={tab.path} element={<Box>{tab.content}</Box>} />
                      ))}
                      <Route path="*" exact element={tabs[0].content} />
                    </Routes>
                  ) : (
                    <Box pt="2">{content}</Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Center>
        </Box>
      </Center>
    </>
  );
}

export default TablyCentered;
