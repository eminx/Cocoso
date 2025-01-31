import React, { useMemo, useState } from 'react';
import { Flex, Skeleton, Wrap } from '@chakra-ui/react';
import InfiniteScroll from 'react-infinite-scroller';
import Masonry from 'react-masonry-css';

import NewEntryHelper from '../generic/NewEntryHelper';
import FiltrerSorter from './FiltrerSorter';

const breakpointColumnsObj = (isLarger) => ({
  default: 4,
  1900: isLarger ? 4 : 2,
  1500: isLarger ? 4 : 2,
  1100: isLarger ? 2 : 1,
  700: isLarger ? 2 : 1,
  480: 1,
});

const defaultItemsPerPage = 12;

const filterHelper = (item, lowerCaseFilterValue) => {
  const { title, subTitle, shortDescription, label, readingMaterial } = item;

  const checker = (field) => {
    if (!field) {
      return false;
    }
    return field.toLowerCase().indexOf(lowerCaseFilterValue) !== -1;
  };

  const itemFiltered =
    checker(label) ||
    checker(readingMaterial) ||
    checker(subTitle) ||
    checker(shortDescription) ||
    checker(title);

  return itemFiltered;
};

const filterItems = (items, filterValue) => {
  if (!filterValue || filterValue === '') {
    return items;
  }

  return items.filter((item) => {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const lowerCaseFilterValue = filterValue.toLowerCase();

    return filterHelper(item, lowerCaseFilterValue);
  });
};

const sortItems = (items, sortValue) => {
  if (!sortValue || sortValue === '') {
    return items;
  }

  return items.sort((a, b) => {
    if (sortValue === 'name') {
      return a.label ? a.label?.localeCompare(b.label) : a.title?.localeCompare(b.title);
    }
    return new Date(b.createdAt || b.creationDate) - new Date(a.createdAt || a.creationDate);
  });
};

const filterSortItems = (items, filterValue, sortValue, currentPage, itemsPerPage) => {
  const filteredItems = filterItems(items, filterValue);
  const filteredSortedItems = sortItems(filteredItems, sortValue);
  return filteredSortedItems.slice(0, itemsPerPage * currentPage);
};

export default function InfiniteScroller({
  canCreateContent = false,
  hideFiltrerSorter = false,
  isMasonry = false,
  items,
  itemsPerPage = defaultItemsPerPage,
  newHelperLink,
  smallThumb,
  children,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValue, setFilterValue] = useState('');
  const [sortValue, setSortValue] = useState('');

  const currentItems = useMemo(
    () => filterSortItems(items, filterValue, sortValue, currentPage, itemsPerPage),
    [items, filterValue, sortValue, currentPage]
  );

  const handleLoad = () => {
    setTimeout(() => {
      setCurrentPage(currentPage + 1);
    }, 300);
  };

  const hasMore = items.length > currentItems.length && currentItems.length >= itemsPerPage;

  const skeletonWidth = smallThumb || isMasonry ? '2xs' : 'auto';
  const skeletonHeight = smallThumb || isMasonry ? '180px' : '315px';

  const filtrerProps = {
    filterValue,
    setFilterValue: (v) => setFilterValue(v),
    sortValue,
    setSortValue: (v) => setSortValue(v),
  };

  return (
    <>
      {!hideFiltrerSorter && (
        <Flex justify="flex-end">
          <FiltrerSorter {...filtrerProps} />
        </Flex>
      )}

      <InfiniteScroll pageStart={1} loadMore={handleLoad} hasMore={hasMore}>
        {isMasonry ? (
          <Masonry
            breakpointCols={breakpointColumnsObj(currentItems?.length > 3)}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {currentItems?.map((item) => children(item))}
            {hasMore && <Skeleton endColor="gray.300" w="185px" h="185px" m="4" />}
            {!hasMore && canCreateContent && (
              <NewEntryHelper buttonLink={newHelperLink} small={isMasonry || smallThumb} />
            )}
          </Masonry>
        ) : (
          <Wrap align="center" justify="center" spacing="2">
            {currentItems?.map((item) => children(item))}
            {hasMore && (
              <Skeleton
                // className="sexy-thumb-container"
                endColor="gray.300"
                h={skeletonHeight}
                w={skeletonWidth}
              />
            )}
            {!hasMore && canCreateContent && (
              <NewEntryHelper buttonLink={newHelperLink} small={smallThumb || isMasonry} />
            )}
          </Wrap>
        )}
      </InfiniteScroll>
    </>
  );
}
