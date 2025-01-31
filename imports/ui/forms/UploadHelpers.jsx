import React from 'react';
import { Box, Code, Flex, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import {
  acceptedImageFormatsForUploads,
  acceptedDocumentFormatsForUploads,
  maximumDocumentSizeForUploads,
} from '../utils/constants/general';

function DocumentUploadHelper({ isImage = false }) {
  const [tc] = useTranslation('common');

  const uploadables = isImage ? acceptedImageFormatsForUploads : acceptedDocumentFormatsForUploads;

  return (
    <Box w="100%" mt="2">
      <Flex justify="space-between">
        <Text fontSize="sm" mb="2" px="2">
          {tc('documents.acceptedFormats')}: <br />
          {uploadables?.map((format) => (
            <Code key={format} bg="white" fontSize="12px" mr="2">
              {format}
            </Code>
          ))}
        </Text>

        <Text fontSize="sm" px="2">
          {tc('documents.maxSize')}: <br />
          <Code bg="white" fontSize="12px">
            {maximumDocumentSizeForUploads}
          </Code>
        </Text>
      </Flex>
    </Box>
  );
}

export { DocumentUploadHelper };
