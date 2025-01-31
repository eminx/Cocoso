import React, { useContext, useEffect, useState } from 'react';
import { Box, Fade, Flex, Slide } from '@chakra-ui/react';

import UserPopup from './UserPopup';
import FederationIconMenu from './FederationIconMenu';
import { StateContext } from '../LayoutContainer';

export default function TopBarHandler({ slideStart }) {
  const { isMobile } = useContext(StateContext);
  const [scrollTop, setScrollTop] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrollTop(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <Slide
        direction="top"
        in={slideStart}
        unmountOnExit
        style={{ zIndex: isOpen ? 2 : 1, pointerEvents: 'none' }}
      >
        <Fade in={scrollTop < 120}>
          <Flex justify="space-between" w="100%">
            <Box pointerEvents="all">
              <FederationIconMenu />
            </Box>
            <Box p="2" pointerEvents="all">
              <UserPopup isOpen={isOpen} setIsOpen={setIsOpen} />
            </Box>
          </Flex>
        </Fade>
      </Slide>

      {isMobile && <Box h="42px" w="100%" />}
    </>
  );
}
