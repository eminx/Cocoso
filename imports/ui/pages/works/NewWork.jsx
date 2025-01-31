import React, { PureComponent } from 'react';
import { Navigate } from 'react-router-dom';
import arrayMove from 'array-move';
import { Box } from '@chakra-ui/react';
import i18n from 'i18next';
import heic2any from 'heic2any';

import convertHeic from '../../../api/_utils/heic-converter';
import { StateContext } from '../../LayoutContainer';
import WorkForm from '../../generic/WorkForm';
import Template from '../../layout/Template';
import { message, Alert } from '../../generic/message';
import { call, resizeImage, uploadImage } from '../../utils/shared';
import FormTitle from '../../forms/FormTitle';
import Loader from '../../generic/Loader';

const formModel = {
  additionalInfo: '',
  categoryId: '',
  contactInfo: '',
  longDescription: '',
  shortDescription: '',
  showAvatar: true,
  title: '',
};

class NewWork extends PureComponent {
  state = {
    categories: [],
    uploadableImages: [],
    uploadableImagesLocal: [],
    isCreating: false,
    isLoading: true,
    isSuccess: false,
    isError: false,
    newWorkId: null,
    values: null,
  };

  componentDidMount() {
    const { currentUser } = this.context;
    const valuesWithContact = {
      ...formModel,
      contactInfo: currentUser.contactInfo,
    };
    this.setState({
      values: valuesWithContact,
    });
    this.getCategories();
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (prevState.uploadableImages.length < this.state.uploadableImages.length) {
  //     this.checkForHeic();
  //   }
  // }

  checkForHeic = async () => {
    const { uploadableImages, uploadableImagesLocal } = this.state;

    const newImages = await Promise.all(
      uploadableImages.map(async (image, index) => {
        if (image.type === 'image/heic') {
          const convertedImage = await heic2any({
            blob: image,
            toType: 'image/jpeg',
            quality: 1,
          });
          convertedImage.name = image.name;
          return convertedImage;
        } else {
          return image;
        }
      })
    );

    const newImagesLocal = await Promise.all(
      uploadableImagesLocal.map(async (image, index) => {
        if (image.substring(0, 15) === 'data:image/heic') {
          const convertedImageLocal = await convertHeic(image);
          return convertedImageLocal;
        } else {
          return image;
        }
      })
    );

    this.setState({
      uploadableImages: newImages,
      uploadableImagesLocal: newImagesLocal,
    });
  };

  getCategories = async () => {
    const categories = await call('getCategories');
    this.setState({
      categories,
      isLoading: false,
    });
  };

  setUploadableImages = (files) => {
    files.forEach((uploadableImage, index) => {
      const reader = new FileReader();
      reader.readAsDataURL(uploadableImage);
      reader.addEventListener(
        'load',
        () => {
          this.setState(({ uploadableImages, uploadableImagesLocal }) => ({
            uploadableImages: [...uploadableImages, uploadableImage],
            uploadableImagesLocal: [...uploadableImagesLocal, reader.result],
          }));
        },
        false
      );
    });
  };

  uploadImages = async (formValues) => {
    const { uploadableImages } = this.state;
    this.setState({
      values: formValues,
      isCreating: true,
    });

    try {
      const imagesReadyToSave = await Promise.all(
        uploadableImages.map(async (uploadableImage, index) => {
          const resizedImage = await resizeImage(uploadableImage, 1200);
          const uploadedImage = await uploadImage(resizedImage, 'workImageUpload');
          return uploadedImage;
        })
      );
      this.createWork(imagesReadyToSave);
    } catch (error) {
      console.error('Error uploading:', error);
      message.error(error.reason);
      this.setState({
        isCreating: false,
        isError: true,
      });
    }
  };

  createWork = async (imagesReadyToSave) => {
    const { values, categories } = this.state;

    const selectedCategory = categories.find((category) => category._id === values.categoryId);

    const parsedValues = {
      ...values,
      category: {
        label: selectedCategory.label,
        color: selectedCategory.color,
        categoryId: selectedCategory._id,
      },
    };
    try {
      const respond = await call('createWork', parsedValues, imagesReadyToSave);
      message.success(i18n.t('common:message.success.create'));
      this.setState({
        newWorkId: respond,
        isCreating: false,
        isSuccess: true,
      });
    } catch (error) {
      message.error(error.reason);
      console.log(error);
      this.setState({ isCreating: false });
    }
  };

  handleRemoveImage = (imageIndex) => {
    this.setState(({ uploadableImages, uploadableImagesLocal }) => ({
      uploadableImages: uploadableImages.filter((image, index) => imageIndex !== index),
      uploadableImagesLocal: uploadableImagesLocal.filter((image, index) => imageIndex !== index),
      // unSavedImageChange: true,
    }));
  };

  handleSortImages = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) {
      return;
    }

    this.setState(({ uploadableImages, uploadableImagesLocal }) => ({
      uploadableImages: arrayMove(uploadableImages, oldIndex, newIndex),
      uploadableImagesLocal: arrayMove(uploadableImagesLocal, oldIndex, newIndex),
      // unSavedImageChange: true,
    }));
  };

  render() {
    const { currentUser, canCreateContent } = this.context;
    const {
      categories,
      isCreating,
      isLoading,
      isSuccess,
      newWorkId,
      values,
      uploadableImagesLocal,
    } = this.state;

    if (isLoading) {
      return <Loader />;
    }

    if (!currentUser || !canCreateContent) {
      return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Alert
            message={i18n.t('members:message.access.contributor', {
              action: 'create work',
            })}
            type="error"
          />
        </div>
      );
    }

    if (isSuccess && newWorkId) {
      return <Navigate to={`/@${currentUser.username}/works/${newWorkId}`} />;
    }

    return (
      <Box>
        <FormTitle context="works" isNew />
        <Template>
          <Box>
            <WorkForm
              categories={categories}
              defaultValues={values}
              images={uploadableImagesLocal}
              isNew
              isSubmitting={isCreating}
              onRemoveImage={this.handleRemoveImage}
              onSortImages={this.handleSortImages}
              onSubmit={this.uploadImages}
              setUploadableImages={this.setUploadableImages}
            />
          </Box>
        </Template>
      </Box>
    );
  }
}

NewWork.contextType = StateContext;

export default NewWork;
