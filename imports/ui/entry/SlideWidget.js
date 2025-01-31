import React from 'react';
import { Flex, Slide } from '@chakra-ui/react';

const flexProps = {
  align: 'flex-start',
  bg: 'rgba(50, 50, 50, .9)',
  justify: 'center',
  minH: '86px',
  pt: '4',
  pb: '2',
  px: '2',
  width: '100%',
};

const slideProps = (slideStart) => ({
  direction: 'bottom',
  in: slideStart,
  unmountOnExit: true,
});

export default function SlideWidget({ slideStart, children, ...otherProps }) {
  return (
    <Slide {...slideProps(slideStart)} style={{ zIndex: 10 }}>
      <Flex {...flexProps} {...otherProps}>
        {children}
      </Flex>
    </Slide>
  );
}
