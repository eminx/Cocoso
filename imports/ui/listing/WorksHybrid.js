import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Center, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import PageHeading from './PageHeading';
import PopupHandler from './PopupHandler';
import InfiniteScroller from './InfiniteScroller';
import NewGridThumb from './NewGridThumb';
import Tag from '../generic/Tag';
import { getCategoriesAssignedToWorks } from '../utils/shared';

export default function WorksHybrid({ works, Host }) {
  const [modalItem, setModalItem] = useState(null);
  const [t] = useTranslation('members');
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category');

  const setCategoryFilter = (categoryFilter) => {
    setSearchParams((params) => {
      params.set('category', categoryFilter);
      return params;
    });
  };

  const getFilteredWorks = () => {
    if (!category || category === 'all') {
      return works;
    }
    return works.filter((work) => work.category && work.category.label === category.toLowerCase());
  };

  const categories = getCategoriesAssignedToWorks(works);

  const worksWithCategoryColors = getFilteredWorks().map((work) => {
    const currentCategory = categories.find((cat) => cat?.label === work?.category?.label);
    const categoryColor = currentCategory?.color;
    return {
      ...work,
      categoryColor,
    };
  });

  const worksInMenu = Host?.settings?.menu?.find((item) => item.name === 'works');
  const description = worksInMenu?.description;
  const heading = worksInMenu?.label;

  return (
    <>
      <PageHeading description={description} heading={heading} />

      <Center px="4">
        <Flex justify="center" wrap="wrap">
          <Tag
            label={t('all')}
            checkable
            checked={Boolean(category) === false || category === 'all'}
            mb="2"
            mr="2"
            onClick={() => setCategoryFilter('all')}
          />
          {categories.map((cat) => (
            <Tag
              key={cat.label}
              checkable
              checked={category === cat.label}
              filterColor={cat.color}
              label={cat.label && cat.label.toUpperCase()}
              mb="2"
              mr="2"
              onClick={() => setCategoryFilter(cat.label)}
            />
          ))}
        </Flex>
      </Center>

      <Box px="2" pb="8">
        <InfiniteScroller isMasonry items={worksWithCategoryColors}>
          {(work) => (
            <Box
              key={work._id}
              borderRadius="8px"
              cursor="pointer"
              mb="2"
              onClick={() => setModalItem(work)}
            >
              <NewGridThumb
                avatar={
                  work.showAvatar && {
                    name: work.authorUsername,
                    url: work.authorAvatar,
                  }
                }
                color={categories.find((cat) => cat?.label === work.category?.label)?.color}
                host={Host?.isPortalHost ? work.host : null}
                imageUrl={work?.images && work.images[0]}
                tag={work.category?.label}
                title={work.title}
              />
            </Box>
          )}
        </InfiniteScroller>

        {modalItem && (
          <PopupHandler item={modalItem} kind="works" onClose={() => setModalItem(null)} />
        )}
      </Box>
    </>
  );
}
