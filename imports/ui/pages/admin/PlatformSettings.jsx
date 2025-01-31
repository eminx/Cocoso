import React, { useState, useEffect, useContext } from 'react';
import { Routes, Navigate, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Center, Flex, Input, Stack, Switch as CSwitch, Text } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

import { StateContext } from '../../LayoutContainer';
import Loader from '../../generic/Loader';
import { message, Alert } from '../../generic/message';
import { call, resizeImage, uploadImage } from '../../utils/shared';
import FormField from '../../forms/FormField';
import FileDropper from '../../forms/FileDropper';
import Tabs from '../../entry/Tabs';
import ReactQuill from '../../forms/Quill';
import Template from '../../layout/Template';
import { AdminMenu } from './Settings';

export default function PlatformSettings() {
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [localImage, setLocalImage] = useState(null);
  const [platform, setPlatform] = useState(null);
  const location = useLocation();
  const { currentUser, getPlatform } = useContext(StateContext);
  const [t] = useTranslation('admin');
  const [tc] = useTranslation('common');

  useEffect(() => {
    getPlatformNow();
  }, []);

  const getPlatformNow = async () => {
    try {
      const respond = await call('getPlatform');
      setPlatform(respond);
      getPlatform();
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  if (!currentUser || !currentUser.isSuperAdmin) {
    return <Alert>{tc('message.access.deny')}</Alert>;
  }

  if (loading) {
    return <Loader />;
  }

  const updatePlatformSettings = async (values) => {
    if (!currentUser || !currentUser.isSuperAdmin) {
      message.error(tc('message.access.deny'));
      return;
    }

    setLoading(true);

    try {
      await call('updatePlatformSettings', values);
      await getPlatformNow();
      message.success(tc('message.success.update', { domain: 'Platform settings' }));
    } catch (error) {
      message.error(error.reason);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (values) => {
    const formValues = {
      name: values.name,
      email: values.email,
    };

    updatePlatformSettings(formValues);
  };

  const handleOptionsSubmit = (values) => {
    const formValues = {
      isFederationLayout: values.isFederationLayout,
      // showFooterInAllCommunities: values.showFooterInAllCommunities,
      // showCommunitiesInMenu: values.showCommunitiesInMenu,
    };

    updatePlatformSettings(formValues);
  };

  const handleFooterChange = (value) => {
    setPlatform({
      ...platform,
      footer: value,
    });
  };

  const handleFooterSubmit = () => {
    const formValues = {
      footer: platform?.footer,
    };

    updatePlatformSettings(formValues);
  };

  const setUploadableImage = (files) => {
    if (files.length > 1) {
      message.error(t('logo.message.fileDropper'));
      return;
    }
    const uploadableImage = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(uploadableImage);
    reader.addEventListener(
      'load',
      () => {
        setLocalImage({
          uploadableImage,
          uploadableImageLocal: reader.result,
        });
      },
      false
    );
  };

  const uploadLogo = async () => {
    setUploading(true);
    try {
      const resizedImage = await resizeImage(localImage.uploadableImage, 800);
      const uploadedImage = await uploadImage(resizedImage, 'platformLogoUpload');
      await call('updatePlatformSettings', { logo: uploadedImage });
      message.success(t('logo.message.success'));
    } catch (error) {
      console.error('Error uploading:', error);
      message.error(error.reason);
    } finally {
      setUploading(false);
    }
  };

  const isImage = localImage && localImage.uploadableImageLocal;

  const tabs = [
    {
      title: t('settings.tabs.info'),
      path: 'info',
      content: (
        <AlphaContainer>
          <Text mb="3" fontWeight="bold">
            {t('info.platform.info')}
          </Text>
          <PlatformSettingsForm initialValues={platform} onSubmit={handleFormSubmit} />
        </AlphaContainer>
      ),
    },
    {
      title: t('settings.tabs.logo'),
      path: 'logo',
      content: (
        <AlphaContainer>
          <Text mb="3" fontWeight="bold">
            {t('logo.info')}
          </Text>
          <Box>
            <FileDropper
              uploadableImageLocal={localImage && localImage.uploadableImageLocal}
              imageUrl={platform?.logo}
              setUploadableImage={setUploadableImage}
              width={isImage && '120px'}
              height={isImage && '80px'}
            />
          </Box>
          {localImage && localImage.uploadableImageLocal && (
            <Center p="2">
              <Button isLoading={uploading} onClick={() => uploadLogo()}>
                {tc('actions.submit')}
              </Button>
            </Center>
          )}
        </AlphaContainer>
      ),
    },
    {
      title: t('settings.tabs.options'),
      path: 'options',
      content: (
        <AlphaContainer>
          <Text mb="3" fontWeight="bold">
            {t('info.platform.options')}
          </Text>
          <PlatformOptions initialValues={platform} onSubmit={handleOptionsSubmit} />
        </AlphaContainer>
      ),
    },
    {
      title: t('settings.tabs.footer'),
      path: 'footer',
      content: (
        <AlphaContainer>
          <Text mb="3" fontWeight="bold">
            {t('info.platform.footer.label')}
          </Text>
          <Text mb="4" w="100%">
            {t('info.platform.footer.description')}
          </Text>
          <Box w="100%">
            <ReactQuill value={platform.footer} onChange={(value) => handleFooterChange(value)} />
            <Flex justify="flex-end" mt="4" w="100%">
              <Button type="submit" onClick={() => handleFooterSubmit(platform)}>
                {tc('actions.submit')}
              </Button>
            </Flex>
          </Box>
        </AlphaContainer>
      ),
    },
  ];

  const pathname = location?.pathname;
  const pathnameLastPart = pathname.split('/').pop();
  const tabIndex = tabs && tabs.findIndex((tab) => tab.path === pathnameLastPart);

  if (tabs && !tabs.find((tab) => tab.path === pathnameLastPart)) {
    return <Navigate to={tabs[0].path} />;
  }

  return (
    <Box>
      <Template heading={tc('menu.superadmin.settings')} leftContent={<AdminMenu />}>
        <Tabs index={tabIndex} tabs={tabs} />

        <Box pt="4">
          <Routes>
            {tabs.map((tab) => (
              <Route key={tab.title} path={tab.path} element={<Box pt="2">{tab.content}</Box>} />
            ))}
          </Routes>
        </Box>
      </Template>
    </Box>
  );
}

function AlphaContainer({ title, children }) {
  return <Box maxWidth={400}>{children}</Box>;
}

function PlatformSettingsForm({ initialValues, onSubmit }) {
  const { handleSubmit, register, formState } = useForm({
    defaultValues: initialValues,
  });

  const { isDirty, isSubmitting } = formState;

  const [t] = useTranslation('admin');
  const [tc] = useTranslation('common');

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))}>
      <Stack spacing="4">
        <FormField label={t('info.platform.name')}>
          <Input {...register('name')} />
        </FormField>
        <FormField label={t('info.platform.email')}>
          <Input type="email" {...register('email')} />
        </FormField>
        <Flex justify="flex-end" py="4">
          <Button isDisabled={!isDirty || isSubmitting} type="submit">
            {tc('actions.submit')}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}

function PlatformOptions({ initialValues, onSubmit }) {
  const { handleSubmit, register, formState } = useForm({
    defaultValues: initialValues,
  });

  const { isDirty, isSubmitting } = formState;

  const [t] = useTranslation('admin');
  const [tc] = useTranslation('common');

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))}>
      <Stack spacing="4">
        <Flex>
          <CSwitch mr="2" mt="2" {...register('isFederationLayout')} />
          <Box>
            <Text fontSize="lg">{t('info.platform.federationLabel')}</Text>
            <Text fontSize="sm">{t('info.platform.federationText')}</Text>
          </Box>
        </Flex>
        <Flex justify="flex-end" py="4">
          <Button isDisabled={!isDirty || isSubmitting} type="submit">
            {tc('actions.submit')}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}
