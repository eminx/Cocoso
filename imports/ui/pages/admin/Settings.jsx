import React, { useState, useEffect, useContext } from 'react';
import { Switch, Redirect, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Center, Text } from '@chakra-ui/react';

import { StateContext } from '../../LayoutContainer';
import Loader from '../../components/Loader';
import Template from '../../components/Template';
import ListMenu from '../../components/ListMenu';
import { message, Alert } from '../../components/message';
import { call, resizeImage, uploadImage } from '../../utils/shared';
import { adminMenu } from '../../utils/constants/general';
import SettingsForm from './SettingsForm';
import FileDropper from '../../components/FileDropper';
import Menu from './Menu';
import Breadcrumb from '../../components/Breadcrumb';
import Tabs from '../../components/Tabs';

export default function Settings({ history }) {
  const [localSettings, setLocalSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [localImage, setLocalImage] = useState(null);

  const { currentUser, currentHost, role } = useContext(StateContext);

  const [t] = useTranslation('admin');
  const [tc] = useTranslation('common');

  if (!currentUser || role !== 'admin') {
    return <Alert>{tc('message.access.deny')}</Alert>;
  }

  useEffect(() => {
    if (!currentHost) {
      return;
    }
    setLocalSettings(currentHost.settings);
    setLoading(false);
  }, []);

  if (loading) {
    return <Loader />;
  }

  const handleFormSubmit = async (values) => {
    if (!currentUser || role !== 'admin') {
      message.error(tc('message.access.deny'));
      return;
    }

    try {
      call('updateHostSettings', values);
      message.success(tc('message.success.update', { domain: tc('domains.settings') }));
    } catch (error) {
      message.error(error.reason);
      console.log(error);
    }
  };

  const setUploadableImage = (files) => {
    setUploading(true);
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
    try {
      const resizedImage = await resizeImage(localImage.uploadableImage, 1000);
      const uploadedImage = await uploadImage(resizedImage, 'hostLogoUpload');
      await call('assignHostLogo', uploadedImage);
      message.success(t('logo.message.success'));
    } catch (error) {
      console.error('Error uploading:', error);
      message.error(error.reason);
      setUploading(false);
    }
  };

  const isImage =
    (localImage && localImage.uploadableImageLocal) || (currentHost && currentHost.logo);

  const tabs = [
    {
      title: t('settings.tabs.info'),
      path: '/admin/settings/organization',
      content: (
        <AlphaContainer>
          <Text mb="3" fontWeight="bold">
            {t('info.info')}
          </Text>
          <SettingsForm initialValues={localSettings} onSubmit={handleFormSubmit} />
        </AlphaContainer>
      ),
    },
    {
      title: t('settings.tabs.logo'),
      path: '/admin/settings/logo',
      content: (
        <AlphaContainer>
          <Text mb="3" fontWeight="bold">
            {t('logo.info')}
          </Text>
          <Box>
            <FileDropper
              uploadableImageLocal={localImage && localImage.uploadableImageLocal}
              imageUrl={currentHost && currentHost.logo}
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
      title: t('settings.tabs.menu'),
      path: '/admin/settings/menu',
      content: (
        <AlphaContainer>
          <Menu />
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
      label: 'Admin',
      link: '/admin/settings',
    },
    {
      label: t('settings.label'),
      link: 'admin/settings',
    },
    {
      label: tabs.find((t) => t.path === pathname).title,
      link: null,
    },
  ];

  return (
    <>
      <Breadcrumb furtherItems={furtherBreadcrumbLinks} />
      <Template
        heading={t('settings.label')}
        leftContent={
          <Box>
            <ListMenu pathname={pathname} list={adminMenu} />
          </Box>
        }
      >
        <Tabs index={tabIndex} tabs={tabs} />

        <Box mb="24">
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
      </Template>
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
