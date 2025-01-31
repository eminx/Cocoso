import React from 'react';
import { Box } from '@chakra-ui/react';

export default function DummyWrapper({ children }) {
  return (
    <Box
      minH="110vh"
      // bg="linear-gradient(0deg, var(--chakra-colors-gray-100) 0%, var(--chakra-colors-brand-50) 100%);"
      bg="rgb(245, 243, 240)"
    >
      {children}
    </Box>
  );
}
