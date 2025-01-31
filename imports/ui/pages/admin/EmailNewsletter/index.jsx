import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Center, Link as CLink, Text } from '@chakra-ui/react';
import ExternalLinkIcon from 'lucide-react/dist/esm/icons/external-link';
import { render as renderEmail } from '@react-email/render';
import { useTranslation } from 'react-i18next';

import Template from '../../../layout/Template';
import { call, resizeImage, uploadImage } from '../../../utils/shared';
import Loader from '../../../generic/Loader';
import { message, Alert } from '../../../generic/message';
import { StateContext } from '../../../LayoutContainer';
import Modal from '../../../generic/Modal';
import EmailPreview from './EmailPreview';
import EmailForm from './EmailForm';
import ConfirmModal from '../../../generic/ConfirmModal';
import { AdminMenu } from '../Settings';

const emailModel = {
  appeal: '',
  body: '',
  footer: '',
  image: {
    imageUrl: '',
    uploadableImage: null,
    uploadableImageLocal: null,
  },
  subject: '',
  items: {
    activities: [],
    works: [],
  },
};

function EmailNewsletter({ history }) {
  const [isSending, setIsSending] = useState(false);
  const [email, setEmail] = useState(emailModel);
  const [isPreview, setIsPreview] = useState(false);
  const [isLastConfirm, setIsLastConfirm] = useState(false);
  const { currentHost, currentUser, role, platform } = useContext(StateContext);
  const [t] = useTranslation('admin');
  const [tc] = useTranslation('common');

  if (!email) {
    return <Loader />;
  }

  if (!currentUser || role !== 'admin') {
    return <Alert>{tc('message.access.deny')}</Alert>;
  }

  const handleFormChange = (field, value) => {
    const newEmail = {
      ...email,
    };
    newEmail[field] = value;
    setEmail(newEmail);
  };

  const handleFormConfirm = () => {
    setIsPreview(true);
  };

  const setUploadableImage = (files) => {
    if (files.length > 1) {
      message.error(tc('plugins.fileDropper.single'));
      return;
    }
    const uploadableImage = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(uploadableImage);
    reader.addEventListener(
      'load',
      () => {
        setEmail({
          ...email,
          image: {
            uploadableImage,
            uploadableImageLocal: reader.result,
            imageUrl: null,
          },
        });
      },
      false
    );
  };

  const uploadLocalImage = async () => {
    setIsSending(true);
    setIsPreview(false);

    const { image } = email;
    const { uploadableImage } = image;

    try {
      const resizedImage = await resizeImage(uploadableImage, 1200);
      const uploadedImage = await uploadImage(resizedImage, 'activityImageUpload');
      sendEmail(uploadedImage);
    } catch (error) {
      console.error('Error uploading:', error);
      message.error(error.reason);
    }
  };

  const handleSelectItems = (items) => {
    setEmail({
      ...email,
      items,
    });
  };

  const handleConfirmSendingEmail = () => {
    const { appeal, body, image, items, subject } = email;
    if (!appeal || !subject) {
      message.error(t('newsletter.error.required'));
      return;
    }

    if (
      (!body || body.length < 3) &&
      !image &&
      !image?.uploadableImageLocal &&
      items.length === 0
    ) {
      message.error(t('newsletter.error.required'));
      return;
    }

    setIsSending(true);

    if (email?.image?.uploadableImage) {
      uploadLocalImage();
    } else {
      sendEmail();
    }
  };

  const sendEmail = async (imageUrl) => {
    const emailHtml = renderEmail(
      <EmailPreview currentHost={currentHost} email={email} imageUrl={imageUrl} />
    );

    const emailValues = {
      appeal: email.appeal,
      body: email.body,
      footer: email.footer,
      items: email.items,
      imageUrl,
      subject: email.subject,
    };

    try {
      await call('sendNewsletter', emailValues, emailHtml, imageUrl);
      setEmail(emailModel);
      message.success(t('newsletter.notification.success.emailsent'));
    } catch (error) {
      message.error(error.reason || error.error);
    } finally {
      setIsSending(false);
      setIsLastConfirm(false);
    }
  };

  return (
    <>
      <Template heading={t('newsletter.title')} leftContent={<AdminMenu />}>
        {currentHost?.isPortalHost && (
          <Box mb="4">
            <Alert
              message={t('newsletter.portalHost.info', { platform: platform.name })}
              type="info"
            />
          </Box>
        )}

        <Box mb="4">
          <Link target="_blank" to="/newsletters">
            <CLink as="span">
              {t('newsletter.labels.previouslink')} <ExternalLinkIcon mt="-1" />
            </CLink>
          </Link>
        </Box>
        <Text mb="4">{t('newsletter.subtitle')}</Text>
        <Box pb="4" mb="4">
          <EmailForm
            currentHost={currentHost}
            email={email}
            onSelectItems={handleSelectItems}
            onChange={handleFormChange}
            onSubmit={handleFormConfirm}
            setUploadableImage={setUploadableImage}
          />
        </Box>
      </Template>

      <Modal
        actionButtonLabel="Send email"
        isOpen={isPreview}
        motionPreset="slideInBottom"
        scrollBehavior="inside"
        size="2xl"
        title={email?.subject}
        onActionButtonClick={() => {
          setIsPreview(false);
          setIsLastConfirm(true);
        }}
        onClose={() => setIsPreview(false)}
      >
        <Center>
          <EmailPreview currentHost={currentHost} email={email} />
        </Center>
      </Modal>

      <ConfirmModal
        confirmButtonProps={{
          isLoading: isSending,
        }}
        confirmText={t('newsletter.modals.yes')}
        title={t('newsletter.modals.title')}
        visible={isLastConfirm}
        zIndex={99999}
        onConfirm={() => handleConfirmSendingEmail()}
        onCancel={() => setIsLastConfirm(false)}
      >
        {t('newsletter.modals.body')}
      </ConfirmModal>
    </>
  );
}

export default EmailNewsletter;
