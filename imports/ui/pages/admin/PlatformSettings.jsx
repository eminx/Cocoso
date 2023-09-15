import React, { useState, useEffect, useContext } from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Input,
  Stack,
  Switch as CSwitch,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';

import { StateContext } from '../../LayoutContainer';
import Loader from '../../components/Loader';
import { message, Alert } from '../../components/message';
import { call, resizeImage, uploadImage } from '../../utils/shared';
import FormField from '../../components/FormField';
import FileDropper from '../../components/FileDropper';
import Breadcrumb from '../../components/Breadcrumb';
import Tabs from '../../components/Tabs';
import ReactQuill from '../../components/Quill';

export default function PlatformSettings({ history }) {
  const [localSettings, setLocalSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [localImage, setLocalImage] = useState(null);

  const { currentUser, platform } = useContext(StateContext);

  const [t] = useTranslation('admin');
  const [tc] = useTranslation('common');

  useEffect(() => {
    if (!currentUser || !currentUser.isSuperAdmin) {
      return;
    }
    setLocalSettings(platform);
    setLoading(false);
  }, []);

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
      showFooterInAllCommunities: values.showFooterInAllCommunities,
      showCommunitiesInMenu: values.showCommunitiesInMenu,
    };

    updatePlatformSettings(formValues);
  };

  const handleTopbarChange = (key, value) => {
    const newTopbar = {
      ...localSettings.topbar,
    };
    newTopbar[key] = value;

    setLocalSettings({
      ...localSettings,
      topbar: newTopbar,
    });
  };

  const handleTopbarSubmit = () => {
    const formValues = {
      topbar: localSettings.topbar,
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
      const resizedImage = await resizeImage(localImage.uploadableImage, 1000);
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
      path: '/superadmin/platform/settings/info',
      content: (
        <AlphaContainer>
          <Text mb="3" fontWeight="bold">
            {t('info.platform.info')}
          </Text>
          <PlatformSettingsForm initialValues={localSettings} onSubmit={handleFormSubmit} />
        </AlphaContainer>
      ),
    },
    {
      title: t('settings.tabs.logo'),
      path: '/superadmin/platform/settings/logo',
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
      path: '/superadmin/platform/settings/options',
      content: (
        <AlphaContainer>
          <Text mb="3" fontWeight="bold">
            {t('info.platform.options')}
          </Text>
          <PlatformOptions initialValues={localSettings} onSubmit={handleOptionsSubmit} />
        </AlphaContainer>
      ),
    },
    {
      title: t('settings.tabs.footer'),
      path: '/superadmin/platform/settings/topbar',
      content: (
        <AlphaContainer>
          <Text fontWeight="bold" mb="3" w="100%">
            {t('info.platform.topbar.label')}
          </Text>
          <VStack spacing="4">
            <Box w="100%">
              <Text fontSize="sm">{t('info.platform.topbar.closed')}</Text>
              <Input
                value={localSettings.topbar?.closed}
                onChange={(event) => {
                  event.preventDefault();
                  handleTopbarChange('closed', event.target.value);
                }}
              />
            </Box>
            <Box w="100%">
              <Text fontSize="sm">{t('info.platform.topbar.open')}</Text>
              <ReactQuill
                value={localSettings.topbar?.open}
                onChange={(value) => handleTopbarChange('open', value)}
              />
            </Box>
            <Flex justify="flex-end" w="100%">
              <Button type="submit" onClick={() => handleTopbarSubmit(localSettings)}>
                {tc('actions.submit')}
              </Button>
            </Flex>
          </VStack>
        </AlphaContainer>
      ),
    },
  ];

  const pathname = history?.location?.pathname;
  const tabIndex = tabs && tabs.findIndex((tab) => tab.path === pathname);

  if (tabs && !tabs.find((tab) => tab.path === pathname)) {
    return <Redirect to={tabs[0].path} />;
  }

  const furtherBreadcrumbLinks = [
    {
      label: 'Platform',
      link: null,
    },
    {
      label: tabs.find((t) => t.path === pathname).title,
      link: null,
    },
  ];

  return (
    <>
      <Box px="4">
        <Breadcrumb furtherItems={furtherBreadcrumbLinks} />
      </Box>
      <Box>
        <Box p="4">
          <Heading color="gray.800" size="lg">
            <Text as="span" fontWeight="normal">
              {tc('menu.admin.platform')}
            </Text>
          </Heading>
        </Box>

        <Box>
          <Box px="4">
            <Tabs index={tabIndex} tabs={tabs} />
          </Box>

          <Box pt="4">
            <Switch history={history}>
              {tabs.map((tab) => (
                <Route
                  key={tab.title}
                  exact
                  path={tab.path}
                  render={(props) => (
                    <Box {...props} pt="2">
                      {tab.content}
                    </Box>
                  )}
                />
              ))}
            </Switch>
          </Box>
        </Box>
      </Box>
    </>
  );
}

function AlphaContainer({ title, children }) {
  return (
    <Box px="4" maxWidth={400}>
      {children}
    </Box>
  );
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
        <Flex align="center">
          <CSwitch mr="2" {...register('showFooterInAllCommunities')} />
          <Text fontSize="sm">{t('info.platform.showfooter')}</Text>
        </Flex>
        <Flex align="center">
          <CSwitch mr="2" {...register('showCommunitiesInMenu')} />
          <Text fontSize="sm">{t('info.platform.showCommunities')}</Text>
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
