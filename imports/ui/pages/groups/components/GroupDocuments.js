import React from 'react';
import { Box, Code, Flex, Link as CLink } from '@chakra-ui/react';
import ExternalLink from 'lucide-react/dist/esm/icons/external-link';

import NiceList from '../../../generic/NiceList';

export default function GroupDocuments({ documents }) {
  if (!documents || documents.length < 1) {
    return null;
  }

  return (
    <Box bg="white" p="4" pt="6">
      <NiceList keySelector="downloadUrl" list={documents}>
        {(document) => (
          <Flex align="center" color="blue.500">
            <Code bg="white" fontWeight="bold" isTruncated mr="1">
              <CLink color="blue.500" href={document.downloadUrl} rel="noreferrer" target="_blank">
                {document.name}
              </CLink>
            </Code>
            <ExternalLink size="18px" />
          </Flex>
        )}
      </NiceList>
    </Box>
  );
}
