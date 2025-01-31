import React from 'react';
import {
  Popover as CPopover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  //   PopoverAnchor,
} from '@chakra-ui/react';

export default function Popover({
  footer,
  isDark = true,
  title,
  triggerComponent,
  children,
  ...otherProps
}) {
  const bg = isDark ? 'gray.800' : 'gray.50';
  const borderColor = isDark ? 'gray.50' : 'gray.800';

  return (
    <CPopover trigger="hover" {...otherProps}>
      <PopoverTrigger>{triggerComponent}</PopoverTrigger>
      <PopoverContent
        bg={bg}
        borderColor={borderColor}
        color={isDark ? 'white' : 'gray.900'}
        maxW="95wv"
        py="4"
        w="auto"
      >
        <PopoverArrow bg={bg} />
        <PopoverCloseButton mr="-1" />
        {title && <PopoverHeader>{title}</PopoverHeader>}
        <PopoverBody>{children}</PopoverBody>
        {footer && <PopoverFooter>{footer}</PopoverFooter>}
      </PopoverContent>
    </CPopover>
  );
}
