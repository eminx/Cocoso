import React, { PureComponent } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import arrayMove from 'array-move';
import { Box, Button, Center } from '@chakra-ui/react';
import i18n from 'i18next';

import { StateContext } from '../../LayoutContainer';
import WorkForm from '../../generic/WorkForm';
import Template from '../../layout/Template';
import { message, Alert } from '../../generic/message';
import ConfirmModal from '../../generic/ConfirmModal';
import { call, resizeImage, uploadImage } from '../../utils/shared';
import Loader from '../../generic/Loader';
import FormTitle from '../../forms/FormTitle';

class EditWork extends PureComponent {
  state = {
    categories: [],
    images: [],
    isDeleted: false,
    isDeleteModalOn: false,
    isError: false,
    isLoading: false,
    isSuccess: false,
    isUpdating: false,
    values: null,
  };

  componentDidMount() {
    this.getWork();
    this.getCategories();
  }

  getCategories = async () => {
    const categories = await call('getCategories');
    this.setState({
      categories,
    });
  };

  getWork = async () => {
    this.setState({ isLoading: true });
    const { username, workId } = this.props;

    try {
      const response = await call('getWork', workId, username);
      const assignedCategory = response?.category;

      this.setState({
        values: {
          ...response,
          category: assignedCategory?.label?.toUpperCase(),
          categoryId: assignedCategory?.categoryId,
        },
        images: response.images?.map((image) => ({
          src: image,
          type: 'uploaded',
        })),
        isLoading: false,
      });
    } catch (error) {
      console.log(error);
      message.error(error.reason);
      this.setState({
        isLoading: false,
      });
    }
  };

  setUploadableImages = (files) => {
    files.forEach((uploadableImage, index) => {
      const reader = new FileReader();
      reader.readAsDataURL(uploadableImage);
      reader.addEventListener(
        'load',
        () => {
          this.setState(({ images }) => ({
            images: [
              ...images,
              {
                resizableData: uploadableImage,
                type: 'not-uploaded',
                src: reader.result,
              },
            ],
          }));
        },
        false
      );
    });
  };

  handleSubmit = (formValues) => {
    const { images } = this.state;
    const isThereUploadable = images?.some((image) => image.type === 'not-uploaded');

    this.setState(
      {
        values: formValues,
        isUpdating: true,
      },
      () => {
        if (!isThereUploadable) {
          const imagesReadyToSave = images?.map((image) => image.src);
          this.updateWork(imagesReadyToSave);
        } else {
          this.uploadImages();
        }
      }
    );
  };

  uploadImages = async () => {
    const { images } = this.state;
    try {
      const imagesReadyToSave = await Promise.all(
        images.map(async (uploadableImage, index) => {
          if (uploadableImage.type === 'uploaded') {
            return uploadableImage.src;
          }
          const resizedImage = await resizeImage(uploadableImage.resizableData, 1200);
          const uploadedImage = await uploadImage(resizedImage, 'workImageUpload');
          return uploadedImage;
        })
      );
      this.updateWork(imagesReadyToSave);
    } catch (error) {
      console.error('Error uploading:', error);
      message.error(error.reason);
      this.setState({
        isUpdating: false,
        isError: true,
      });
    }
  };

  updateWork = async (imagesReadyToSave) => {
    const { workId } = this.props;
    const { values, categories } = this.state;
    const { currentUser } = this.context;

    if (values.authorId !== currentUser._id) {
      return;
    }

    const selectedCategory = categories.find((category) => category._id === values.categoryId);

    const { _id, categoryId, ...parsedValues } = values;

    parsedValues.category = {
      label: selectedCategory?.label,
      color: selectedCategory?.color,
      categoryId: selectedCategory?._id,
    };

    try {
      await call('updateWork', workId, parsedValues, imagesReadyToSave);
      message.success(i18n.t('common:message.success.update'));
      this.setState({
        isUpdating: false,
        isSuccess: true,
      });
    } catch (error) {
      message.error(error.reason);
      this.setState({ isUpdating: false });
    }
  };

  handleRemoveImage = (imageIndex) => {
    this.setState(({ images }) => ({
      images: images.filter((image, index) => imageIndex !== index),
      // unSavedImageChange: true,
    }));
  };

  handleSortImages = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) {
      return;
    }

    this.setState(({ images }) => ({
      images: arrayMove(images, oldIndex, newIndex),
      // unSavedImageChange: true,
    }));
  };

  handleDeleteWork = async () => {
    const { workId } = this.props;
    const { currentUser } = this.context;
    const { values } = this.state;

    if (values.authorId !== currentUser._id) {
      return;
    }

    this.setState({ isLoading: true });

    try {
      await call('deleteWork', workId);
      this.setState({
        isLoading: false,
        isDeleted: true,
      });
      message.success(i18n.t('common:message.success.remove'));
    } catch (error) {
      message.error(error.reason);
      this.setState({ isLoading: false });
    }
  };

  hideDeleteModal = () => this.setState({ isDeleteModalOn: false });
  showDeleteModal = () => this.setState({ isDeleteModalOn: true });

  render() {
    const { workId } = this.props;
    const { currentUser } = this.context;
    const {
      categories,
      images,
      isUpdating,
      isDeleted,
      isLoading,
      isSuccess,
      isDeleteModalOn,
      values,
    } = this.state;

    if (!currentUser) {
      return <Alert message={i18n.t('common:message.access.deny')} />;
    }

    if (isLoading || !values) {
      return <Loader />;
    }

    if (currentUser._id !== values.authorId) {
      return <Alert message={i18n.t('common:message.access.deny')} />;
    }

    const workRoute = `/@${currentUser.username}/works/${workId}`;
    if (isSuccess) {
      return <Navigate to={workRoute} />;
    }

    if (isDeleted) {
      return <Navigate to={`/@${currentUser.username}`} />;
    }

    return (
      <Box>
        <FormTitle context="works" />
        <Template>
          <Box>
            <WorkForm
              categories={categories}
              defaultValues={values}
              images={images?.map((image) => image.src)}
              isSubmitting={isUpdating}
              onRemoveImage={this.handleRemoveImage}
              onSortImages={this.handleSortImages}
              onSubmit={this.handleSubmit}
              setUploadableImages={this.setUploadableImages}
            />
          </Box>

          <Center p="4">
            <Button colorScheme="red" size="sm" variant="ghost" onClick={this.showDeleteModal}>
              {i18n.t('common:actions.remove')}
            </Button>
          </Center>

          <ConfirmModal
            visible={isDeleteModalOn}
            onConfirm={this.handleDeleteWork}
            onCancel={this.hideDeleteModal}
            title={i18n.t('common:modals.confirm.delete.title')}
          >
            {i18n.t('common:modals.confirm.delete.body', {
              domain: i18n.t('common:domains.work').toLowerCase(),
            })}
          </ConfirmModal>
        </Template>
      </Box>
    );
  }
}

EditWork.contextType = StateContext;

export default function EditWorkPage() {
  const { usernameSlug, workId } = useParams();
  const [empty, username] = usernameSlug.split('@');
  return <EditWork username={username} workId={workId} />;
}
