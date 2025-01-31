import React, { useEffect, useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Center, Flex } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import arrayMove from 'array-move';

import PageForm from '../../generic/PageForm';
import { call, parseTitle, resizeImage, uploadImage } from '../../utils/shared';
import Loader from '../../generic/Loader';
import ConfirmModal from '../../generic/ConfirmModal';
import { message, Alert } from '../../generic/message';
import { StateContext } from '../../LayoutContainer';
import Template from '../../layout/Template';
import FormTitle from '../../forms/FormTitle';

function EditPage() {
  const { currentUser, role } = useContext(StateContext);

  const [images, setImages] = useState([]);
  const [page, setPage] = useState(null);
  const [pageTitles, setPageTitles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOn, setIsDeleteModalOn] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const navigate = useNavigate();
  const { pageId } = useParams();
  const [t] = useTranslation('admin');
  const [tc] = useTranslation('common');

  useEffect(() => {
    Meteor.call('getPages', (error, respond) => {
      const currentPage =
        respond?.length > 0 && respond.find((page) => parseTitle(page.title) === pageId);
      setPage(currentPage);
      currentPage.images &&
        setImages(
          currentPage.images.map((image) => ({
            src: image,
            type: 'uploaded',
          }))
        );
      setPageTitles(respond.map((page) => page.title));
      setIsLoading(false);
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
              resizableData: uploadableImage,
              src: reader.result,
              type: 'not-uploaded',
            },
          ]);
        },
        false
      );
    });
  };

  const handleSubmit = (formValues) => {
    setIsUpdating(true);
    if (!images || images.length === 0) {
      updatePage(formValues, []);
      return;
    }
    uploadImages(formValues);
  };

  const uploadImages = async (formValues) => {
    const isThereUploadable = images.some((image) => image.type === 'not-uploaded');
    if (!isThereUploadable) {
      const imagesReadyToSave = images.map((image) => image.src);
      updatePage(formValues, imagesReadyToSave);
      return;
    }

    try {
      const imagesReadyToSave = await Promise.all(
        images.map(async (uploadableImage, index) => {
          if (uploadableImage.type === 'uploaded') {
            return uploadableImage.src;
          }
          const resizedImage = await resizeImage(uploadableImage.resizableData, 1200);
          const uploadedImage = await uploadImage(resizedImage, 'pageImageUpload');
          return uploadedImage;
        })
      );
      updatePage(formValues, imagesReadyToSave);
    } catch (error) {
      console.error('Error uploading:', error);
      message.error(error.reason);
    }
  };

  const updatePage = async (formValues, imagesReadyToSave) => {
    if (!currentUser || role !== 'admin') {
      message.error(tc('message.access.deny'));
      return false;
    }

    if (
      pageTitles
        .filter((title) => page.title !== title)
        .some((title) => title.toLowerCase() === formValues.title.toLowerCase())
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
      await call('updatePage', page._id, formValues, imagesReadyToSave);
      message.success(tc('message.success.create'));
      navigate(`pages/${parseTitle(formValues.title)}`);
    } catch (error) {
      setIsUpdating(false);
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

  const handleDeletePage = async () => {
    if (!currentUser || role !== 'admin') {
      message.error(tc('message.access.deny'));
      return false;
    }

    try {
      await call('deletePage', page._id);
      message.success(tc('message.success.remove'));
      navigate('/pages');
    } catch (error) {
      console.log(error);
    }
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

  if (!page || isLoading) {
    return <Loader />;
  }

  return (
    <Box>
      <FormTitle context="pages" />
      <Template>
        <Box>
          <PageForm
            defaultValues={page}
            images={images.map((image) => image.src)}
            isButtonLoading={isUpdating}
            onRemoveImage={handleRemoveImage}
            onSortImages={handleSortImages}
            onSetUploadableImages={handleSetUploadableImages}
            onSubmit={handleSubmit}
          />

          <Flex justify="center" py="4">
            <Button
              colorScheme="red"
              size="sm"
              variant="ghost"
              onClick={() => setIsDeleteModalOn(true)}
            >
              {t('pages.actions.delete')}
            </Button>
          </Flex>
        </Box>

        <ConfirmModal
          visible={isDeleteModalOn}
          onConfirm={handleDeletePage}
          onCancel={() => setIsDeleteModalOn(false)}
          title={tc('modal.confirm.delete.title')}
        >
          {tc('modals.confirm.delete.body', {
            domain: tc('domains.page').toLowerCase(),
          })}
        </ConfirmModal>
      </Template>
    </Box>
  );
}

export default EditPage;
