import React, { useEffect, useState } from 'react';
import { Center, Wrap } from '@chakra-ui/react';
import ReactPaginate from 'react-paginate';
import Masonry from 'react-masonry-css';

import '../utils/styles/paginate.css';

import NewEntryHelper from '../generic/NewEntryHelper';

const defaultItemsPerPage = 12;

function PaginatedItems({
  canCreateContent = false,
  isMasonry = false,
  items,
  itemsPerPage = defaultItemsPerPage,
  newHelperLink,
  children,
}) {
  const [currentPage, setCurrentPage] = useState(0);
  const [currentItems, setCurrentItems] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);

  useEffect(() => {
    if (!items) {
      return;
    }
    const newPageCount = Math.ceil(items.length / itemsPerPage);
    setPageCount(newPageCount);
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(items.slice(itemOffset, endOffset));
  }, [itemOffset, items, itemsPerPage]);

  const handlePageChange = (page) => {
    if (page === currentPage) {
      return;
    }
    const newOffset = (page * itemsPerPage) % items.length;
    setItemOffset(newOffset);
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    handlePageChange(0);
  }, [items?.length]);

  const breakpointColumnsObj = {
    default: 4,
    1900: 5,
    1500: 4,
    1100: 3,
    700: 2,
    480: 1,
  };

  return (
    <>
      {isMasonry ? (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {currentItems?.map((item) => children(item))}
          {canCreateContent && currentPage + 1 === pageCount && (
            <NewEntryHelper buttonLink={newHelperLink} isMasonry={isMasonry} />
          )}
        </Masonry>
      ) : (
        <Wrap justify="center" spacing="8" shouldWrapChildren>
          {currentItems?.map((item) => children(item))}
          {canCreateContent && currentPage + 1 === pageCount && (
            <NewEntryHelper buttonLink={newHelperLink} isMasonry={isMasonry} />
          )}
        </Wrap>
      )}
      {items && items.length > itemsPerPage && (
        <Center>
          <ReactPaginate
            forcePage={currentPage}
            containerClassName="paginate"
            pageLinkClassName="paginate-btn"
            previousLinkClassName="paginate-btn"
            nextLinkClassName="paginate-btn"
            activeLinkClassName="paginate-active-btn"
            previousLabel="Prev"
            nextLabel="Next"
            breakLabel="..."
            onPageChange={(event) => handlePageChange(event.selected)}
            pageRangeDisplayed={5}
            pageCount={pageCount}
            renderOnZeroPageCount={null}
          />
        </Center>
      )}
    </>
  );
}

export default PaginatedItems;
