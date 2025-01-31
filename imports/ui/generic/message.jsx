import React from 'react';
import {
  Alert as CAlert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  CloseButton,
} from '@chakra-ui/react';

const timeOutTime = 5000;

const renderToast = (status, text, duration) => {
  console.log(status + ': ' + text);
  return;
  // toast({
  //   description: text,
  //   duration: duration || timeOutTime,
  //   isClosable: true,
  //   position: 'top',
  //   status,
  // });
};

const message = {
  success: (text, duration) => renderToast('success', text, duration),
  error: (text, duration) => renderToast('error', text, duration),
  info: (text, duration = timeOutTime) => renderToast('info', text, duration),
};

const Alert = ({ children, isClosable, message, type = 'error', ...otherProps }) => {
  return (
    <Box w="100%" maxW="500px">
      <CAlert status={type} {...otherProps}>
        <AlertIcon />
        <Box flex="1">
          {/* <AlertTitle>
              {success ? 'Success!' : info ? 'Info' : warning ? 'Warning' : 'Error'}
            </AlertTitle> */}
          <AlertDescription display="block">{children || message}</AlertDescription>
        </Box>
        {isClosable && <CloseButton position="absolute" right="8px" top="8px" />}
      </CAlert>
    </Box>
  );
};

export { message, Alert };
