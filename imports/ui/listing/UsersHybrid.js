import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, Center, Divider, Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import parseHtml from 'html-react-parser';
import Cascader from 'antd/lib/cascader';
import { parse } from 'query-string';

import PageHeading from './PageHeading';
import InfiniteScroller from './InfiniteScroller';
import MemberAvatarEtc from '../generic/MemberAvatarEtc';
import Tabs from '../entry/Tabs';
import Modal from '../generic/Modal';

export default function UsersHybrid({ users, keywords, Host }) {
  const [modalItem, setModalItem] = useState(null);
  const [, setFilterKeyword] = useState(null);
  const [selectedProfile] = useState(null);
  const [tm] = useTranslation('members');
  const location = useLocation();
  const navigate = useNavigate();
  const { search } = location;
  const { showKeywordSearch } = parse(search, { parseBooleans: true });

  const cascaderOptions = useMemo(
    () => [
      ...keywords.map((kw) => ({
        label: kw.label,
        value: kw._id,
        children: users
          .filter((m) => m?.keywords?.map((k) => k.keywordId)?.includes(kw._id))
          ?.map((mx) => ({
            label: mx.username,
            value: mx.username,
          })),
      })),
      {
        label: tm('all'),
        value: 'allMembers',
        children: users.map((m) => ({
          label: m.username,
          value: m.username,
        })),
      },
    ],
    [users?.length, keywords?.length]
  );

  const usersInMenu = Host?.settings?.menu?.find((item) => item.name === 'people');
  const description = usersInMenu?.description;
  const heading = usersInMenu?.label;

  const tabs = [
    {
      path: '/people',
      title: tm('labels.list'),
    },
    {
      path: '/people?showKeywordSearch=true',
      title: tm('labels.search'),
    },
  ];

  const cascaderRender = (menus) => (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        position: 'relative',
      }}
    >
      <div>{menus}</div>
      <Divider orientation="vertical" />
      {selectedProfile && (
        <Box
          _hover={{ bg: 'brand.50' }}
          border="1px solid"
          borderColor="brand.500"
          cursor="pointer"
          maxH="480px"
          mx="2"
          p="2"
          w="310px"
          onClick={() => setModalItem(selectedProfile)}
        >
          <Center>
            <Box>
              <Center>
                <Avatar
                  borderRadius="0"
                  name={selectedProfile.username}
                  size="2xl"
                  src={selectedProfile.avatar?.src}
                />
              </Center>
              <Center pt="2">
                <Button variant="link">
                  <Text textAlign="center" fontSize="xl">
                    {selectedProfile.username}
                  </Text>
                </Button>
              </Center>

              <Divider my="2" />

              {selectedProfile.bio && (
                <Box borderLeft="4px solid" borderColor="brand.500" pl="2">
                  {parseHtml(selectedProfile.bio)}
                </Box>
              )}
            </Box>
          </Center>
        </Box>
      )}
    </div>
  );

  const filterCascaderOptions = (inputValue, path) =>
    path.some((option) => option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1);

  const handleCascaderSelect = (value) => {
    const username = value[1];
    const selectedItem = users.find((u) => u.username === username);
    if (selectedItem) {
      setModalItem(selectedItem);
    }
  };

  return (
    <>
      <PageHeading description={description} heading={heading} />

      <Center>
        <Tabs index={showKeywordSearch ? 1 : 0} mb="4" tabs={tabs} />
      </Center>

      {showKeywordSearch ? (
        <Flex justify="center">
          <Cascader
            changeOnSelect
            dropdownRender={cascaderRender}
            open
            options={cascaderOptions}
            popupClassName="cascader-container cascader-container--open"
            showSearch={{ filterCascaderOptions }}
            size="large"
            style={{ borderRadius: 0, width: 240 }}
            onRemove={() => setFilterKeyword('')}
            onChange={handleCascaderSelect}
          />
        </Flex>
      ) : (
        <Box>
          <Center mb="4">
            <Text fontSize="sm">{tm('message.sortedRandomly')}</Text>
          </Center>

          <InfiniteScroller hideFiltrerSorter isMasonry items={users}>
            {(user) => (
              <Box key={user.username} cursor="pointer" onClick={() => setModalItem(user)}>
                <MemberAvatarEtc user={user} />
              </Box>
            )}
          </InfiniteScroller>
        </Box>
      )}

      <Modal
        actionButtonLabel={'Visit Profile'}
        bg="gray.100"
        isOpen={Boolean(modalItem)}
        size="xl"
        onActionButtonClick={() => navigate(`/@${modalItem.username}`)}
        onClose={() => setModalItem(null)}
      >
        <MemberAvatarEtc isThumb={false} user={modalItem} />
      </Modal>
    </>
  );
}
