import React from 'react';
import { Box, Button, Center, Flex, Text, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import FileDropper from '../../forms/FileDropper';

export default function AvatarUploader({
  imageUrl,
  isUploading,
  uploadableAvatarLocal,
  removeAvatar,
  setUploadableAvatar,
  setUploadableAvatarLocal,
  uploadAvatar,
}) {
  const [t] = useTranslation('accounts');
  const [tc] = useTranslation('common');

  return (
    <Flex mb="4">
      <Box>
        <Box h="120px" w="120px" flexShrink="0">
          <FileDropper
            imageUrl={imageUrl}
            label={t('profile.form.avatar.fileDropper')}
            height="100%"
            imageFit="cover"
            setUploadableImage={setUploadableAvatar}
          />
        </Box>
        {uploadableAvatarLocal && (
          <Box>
            <VStack spacing="2" p="4">
              <Button
                colorScheme="green"
                isLoading={isUploading}
                size="sm"
                variant="solid"
                onClick={() => uploadAvatar()}
              >
                {tc('actions.submit')}
              </Button>
              <Button
                colorScheme="red"
                margin={{ top: 'small' }}
                size="sm"
                variant="ghost"
                onClick={() => {
                  setUploadableAvatar(null);
                  setUploadableAvatarLocal(null);
                }}
              >
                {t('profile.form.avatar.remove')}
              </Button>
            </VStack>
          </Box>
        )}
      </Box>
      {!uploadableAvatarLocal && (
        <Box px="6">
          <Text fontSize="sm">{t('profile.form.avatar.changeHelper')}</Text>
          {imageUrl && (
            <Button colorScheme="red" my="4" size="sm" onClick={removeAvatar}>
              {t('profile.form.avatar.remove')}
            </Button>
          )}
        </Box>
      )}
    </Flex>
  );
}
