import React from 'react';
import Dropzone from 'react-dropzone';
import { Center, Flex, Image, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

const containerStyle = {
  borderRadius: 8,
};

export default function FileDropper({
  height = '280px',
  imageFit = 'contain',
  imageUrl,
  round = false,
  uploadableImageLocal,
  setUploadableImage,
  isMultiple = false,
  ...otherProps
}) {
  if (round) {
    containerStyle.borderRadius = '50%';
    containerStyle.overflow = 'hidden';
  }

  const [tc] = useTranslation('common');
  return (
    <Dropzone onDrop={setUploadableImage} isMultiple={isMultiple}>
      {({ getRootProps, getInputProps, isDragActive }) => (
        <Flex
          {...getRootProps()}
          _hover={{ bg: 'gray.50', borderColor: 'gray.500' }}
          align="center"
          bg={isDragActive ? 'gray.300' : 'white'}
          border="2px dashed"
          borderColor={isDragActive ? 'gray.600' : 'gray.300'}
          cursor="grab"
          direction="column"
          justify="center"
          h={height}
          w="100%"
          {...containerStyle}
          {...otherProps}
        >
          {uploadableImageLocal || imageUrl ? (
            <Image
              fit={imageFit}
              width="100%"
              height="100%"
              src={uploadableImageLocal || imageUrl}
              style={{ cursor: 'pointer' }}
            />
          ) : (
            <Center p="8">
              <Text textAlign="center" fontSize="sm">
                {isMultiple
                  ? tc('plugins.fileDropper.helperMultiple')
                  : tc('plugins.fileDropper.helper')}
              </Text>
            </Center>
          )}
          <input {...getInputProps()} />
        </Flex>
      )}
    </Dropzone>
  );
}
