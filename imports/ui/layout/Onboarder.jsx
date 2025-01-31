import React, { useRef } from 'react';
import {
  Box,
  Button,
  ButtonGroup,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
} from '@chakra-ui/react';

function Onboarder({
  children,
  firstButtonLabel,
  footer,
  header,
  secondButtonLabel,
  trigger,
  onFirstButtonClick,
  onSecondButtonClick,
  ...otherProps
}) {
  const initialFocusRef = useRef();

  return (
    <Popover
      initialFocusRef={initialFocusRef}
      placement="bottom"
      closeOnBlur={false}
      {...otherProps}
    >
      <PopoverTrigger>
        <Box>{trigger}</Box>
      </PopoverTrigger>
      <PopoverContent color="white" bg="blue.800" borderColor="blue.800">
        <PopoverHeader pt={4} fontWeight="bold" border="0">
          {header}
        </PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>{children}</PopoverBody>
        <PopoverFooter
          border="0"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          pb={4}
        >
          {footer && <Box fontSize="sm">{footer}</Box>}
          <ButtonGroup size="sm">
            {firstButtonLabel && onFirstButtonClick && (
              <Button colorScheme="green" onClick={onFirstButtonClick}>
                {firstButtonLabel}
              </Button>
            )}
            {secondButtonLabel && onSecondButtonClick && (
              <Button colorScheme="blue" ref={initialFocusRef} onClick={onSecondButtonClick}>
                {secondButtonLabel}
              </Button>
            )}
          </ButtonGroup>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
}

export default Onboarder;
