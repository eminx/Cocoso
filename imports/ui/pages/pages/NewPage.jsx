import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Center } from '@chakra-ui/react';
import arrayMove from 'array-move';
import { useTranslation } from 'react-i18next';

import PageForm from '../../generic/PageForm';
import Template from '../../layout/Template';
import { message, Alert } from '../../generic/message';
import { call, parseTitle, resizeImage, uploadImage } from '../../utils/shared';
import { StateContext } from '../../LayoutContainer';
import FormTitle from '../../forms/FormTitle';

function NewPage() {
  const { currentUser, role } = useContext(StateContext);
  const [pageTitles, setPageTitles] = useState([]);
  const [images, setImages] = useState([]);
  const [newPageId, setNewPageId] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [tc] = useTranslation('common');

  useEffect(() => {
    Meteor.call('getPages', (error, respond) => {
      setPageTitles(respond.map((page) => page.title));
    });
  }, []);

  const handleSetUploadableImages = async (files) => {
    files.forEach((uploadableImage, index) => {
      const reader = new FileReader();
      reader.readAsDataURL(uploadableImage);
      reader.addEventListener(
        'load',
        () => {
          setImages((images) => [
            ...images,
            {
              src: reader.result,
              resizableData: uploadableImage,
            },
          ]);
        },
        false
      );
    });
  };

  const handleSubmit = (formValues) => {
    setIsCreating(true);
    if (!images || images.length === 0) {
      createPage(formValues, []);
      return;
    }
    uploadImages(formValues);
  };

  const uploadImages = async (formValues) => {
    try {
      const imagesReadyToSave = await Promise.all(
        images.map(async (uploadableImage, index) => {
          const resizedImage = await resizeImage(uploadableImage.resizableData, 1200);
          const uploadedImage = await uploadImage(resizedImage, 'pageImageUpload');
          return uploadedImage;
        })
      );
      createPage(formValues, imagesReadyToSave);
    } catch (error) {
      console.error('Error uploading:', error);
      message.error(error.reason);
    }
  };

  const createPage = async (formValues, imagesReadyToSave) => {
    if (!currentUser || role !== 'admin') {
      message.error(tc('message.access.deny'));
      return false;
    }

    if (
      pageTitles &&
      formValues &&
      pageTitles.some((title) => title.toLowerCase() === formValues.title.toLowerCase())
    ) {
      message.error(
        tc('message.exists', {
          domain: tc('domains.page').toLowerCase(),
          property: tc('domains.props.title'),
        })
      );
      return;
    }

    try {
      const result = await call('createPage', formValues, imagesReadyToSave);
      message.success(tc('message.success.create'));
      setNewPageId(parseTitle(result));
    } catch (error) {
      setIsCreating(false);
      console.log('error', error);
    }
  };

  const handleRemoveImage = (imageIndex) => {
    setImages(images.filter((image, index) => imageIndex !== index));
  };

  const handleSortImages = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) {
      return;
    }
    setImages(arrayMove(images, oldIndex, newIndex));
  };

  if (!currentUser || role !== 'admin') {
    return (
      <Center p="4">
        <Alert
          message={tc('message.access.admin', {
            domain: `${tc('domains.static')} ${tc('domains.page').toLowerCase()}`,
          })}
          type="error"
        />
      </Center>
    );
  }

  if (newPageId) {
    return <Navigate to={`/pages/${newPageId}`} />;
  }

  return (
    <>
      <FormTitle context="pages" isNew />
      <Template>
        <Box>
          <PageForm
            images={images.map((image) => image.src)}
            isButtonLoading={isCreating}
            onRemoveImage={handleRemoveImage}
            onSortImages={handleSortImages}
            onSetUploadableImages={handleSetUploadableImages}
            onSubmit={handleSubmit}
          />
        </Box>
      </Template>
    </>
  );
}

export default NewPage;
