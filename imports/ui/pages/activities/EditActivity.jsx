import React, { PureComponent } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Button, Center, VStack } from '@chakra-ui/react';
import arrayMove from 'array-move';

import ActivityForm from '../../forms/ActivityForm';
import Template from '../../layout/Template';
import ConfirmModal from '../../generic/ConfirmModal';
import FormSwitch from '../../forms/FormSwitch';
import Loader from '../../generic/Loader';
import {
  call,
  compareDatesWithStartDateForSort,
  checkAndSetBookingsWithConflict,
  getAllBookingsWithSelectedResource,
  resizeImage,
  uploadImage,
} from '../../utils/shared';
import { message, Alert } from '../../generic/message';
import { StateContext } from '../../LayoutContainer';
import FormTitle from '../../forms/FormTitle';

const formModel = {
  resourceId: '',
  title: '',
  subTitle: '',
  place: '',
  address: '',
};

class EditActivity extends PureComponent {
  state = {
    datesAndTimes: [],
    formValues: formModel,
    isDeleteModalOn: false,
    isUpdating: false,
    isDeleted: false,
    isError: false,
    isLoading: false,
    images: [],
    isSuccess: false,
    isExclusiveActivity: true,
    isPublicActivity: false,
    isRegistrationDisabled: false,
    longDescription: '',
  };

  componentDidMount() {
    this.setInitialData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      (!prevProps.activity && this.props.activity) ||
      (!prevProps.allBookings && this.props.allBookings) ||
      (!prevProps.resources && this.props.resources)
    ) {
      this.setInitialData();
    }
  }

  setInitialData = () => {
    const { activity } = this.props;
    if (!activity) {
      return;
    }
    const { datesAndTimes } = activity;

    this.setState(
      {
        datesAndTimes: [...datesAndTimes],
        isPublicActivity: activity.isPublicActivity,
        isExclusiveActivity: Boolean(activity.isExclusiveActivity),
        isRegistrationDisabled: activity.isRegistrationDisabled,
        images: activity?.images?.map((image) => ({
          src: image,
          type: 'uploaded',
        })),
      },
      () => this.validateBookings()
    );
  };

  handleFormValueChange = (formValues) => {
    this.setState({
      formValues,
    });
  };

  handleQuillChange = (longDescription) => {
    this.setState({
      longDescription,
    });
  };

  setUploadableImages = (files) => {
    files.forEach((uploadableImage, index) => {
      const reader = new FileReader();
      reader.readAsDataURL(uploadableImage);
      reader.addEventListener(
        'load',
        () => {
          this.setState(({ images }) => ({
            images: images
              ? [
                  ...images,
                  {
                    resizableData: uploadableImage,
                    type: 'not-uploaded',
                    src: reader.result,
                  },
                ]
              : [
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

  handleSubmit = (values) => {
    const { resources } = this.props;
    const { isPublicActivity, images } = this.state;

    const formValues = { ...values };
    if (values.resourceId) {
      const selectedResource = resources.find((r) => r._id === values.resourceId);
      formValues.resource = selectedResource?.label;
      formValues.resourceId = selectedResource?._id;
      formValues.resourceIndex = selectedResource?.resourceIndex;
    }

    const isThereUploadable = images?.some((image) => image.type === 'not-uploaded');

    this.setState(
      {
        formValues,
        isUpdating: true,
      },
      () => {
        if (isPublicActivity && images?.length && isThereUploadable) {
          this.uploadImages();
        } else {
          const imagesReadyToSave = images?.map((image) => image.src);
          this.updateActivity(imagesReadyToSave);
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
          const resizedImage = await resizeImage(uploadableImage.resizableData, 800);
          const uploadedImage = await uploadImage(resizedImage, 'activityImageUpload');
          return uploadedImage;
        })
      );
      this.updateActivity(imagesReadyToSave);
    } catch (error) {
      console.error('Error uploading:', error);
      message.error(error.reason);
      this.setState({
        isUpdating: false,
        isError: true,
      });
    }
  };

  updateActivity = async (imagesReadyToSave) => {
    const { activity, tc } = this.props;
    const {
      formValues,
      isExclusiveActivity,
      isPublicActivity,
      isRegistrationDisabled,
      datesAndTimes,
    } = this.state;

    const datesAndTimesSorted = datesAndTimes.sort(compareDatesWithStartDateForSort);

    const values = {
      ...formValues,
      datesAndTimes: datesAndTimesSorted,
      images: imagesReadyToSave,
      isExclusiveActivity,
      isPublicActivity,
      isRegistrationDisabled,
    };

    try {
      await call('updateActivity', activity._id, values);
      message.success(tc('message.success.update'));
      this.setState({ isSuccess: true });
    } catch (error) {
      console.log(error);
      message.error(error.error || error.reason);
      this.setState({
        isUpdating: false,
        isError: true,
      });
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

  hideDeleteModal = () => this.setState({ isDeleteModalOn: false });
  showDeleteModal = () => this.setState({ isDeleteModalOn: true });

  deleteActivity = async () => {
    const { activity, tc } = this.props;

    try {
      await call('deleteActivity', activity._id);
      message.success(tc('message.success.remove'));
      this.setState({
        isDeleted: true,
      });
    } catch (error) {
      console.log(error);
      this.setState({
        isUpdating: false,
        isError: true,
      });
    }
  };

  handlePublicActivitySwitch = (event) => {
    const value = event.target.checked;
    this.setState({
      isPublicActivity: value,
      isExclusiveActivity: true,
    });
  };

  handleExclusiveSwitch = (event) => {
    const value = event.target.checked;

    this.setState(
      {
        isExclusiveActivity: value,
      },
      () => this.validateBookings()
    );
  };

  handleRegistrationSwitch = () => {
    this.setState(({ isRegistrationDisabled }) => ({
      isRegistrationDisabled: !isRegistrationDisabled,
    }));
  };

  setDatesAndTimes = (datesAndTimes) => {
    this.setState(
      {
        datesAndTimes,
      },
      () => {
        this.validateBookings();
      }
    );
  };

  handleSelectedResource = (value) => {
    this.setState(
      {
        selectedResource: this.findResourceFromId(value),
      },
      () => this.validateBookings()
    );
  };

  findResourceFromId = (resourceId) => {
    const { resources } = this.props;
    return resources.find((r) => r._id === resourceId);
  };

  validateBookings = () => {
    const { activity, allBookings } = this.props;
    const { selectedResource, datesAndTimes, isExclusiveActivity } = this.state;

    if (!selectedResource || !datesAndTimes || datesAndTimes.length === 0) {
      return;
    }
    const allBookingsWithSelectedResource = getAllBookingsWithSelectedResource(
      selectedResource,
      allBookings
    );

    const selectedBookingsWithConflict = checkAndSetBookingsWithConflict(
      datesAndTimes,
      allBookingsWithSelectedResource,
      activity._id
    );

    const selectedBookingsWithConflictButNotExclusive = selectedBookingsWithConflict.map((item) => {
      const booking = { ...item };
      if (item.conflict) {
        booking.isConflictOK = !item.conflict.isExclusiveActivity && !isExclusiveActivity;
      }
      return booking;
    });

    this.setState({
      datesAndTimes: selectedBookingsWithConflictButNotExclusive,
    });
  };

  isFormValid = () => {
    const { datesAndTimes } = this.state;

    const isConflictHard =
      datesAndTimes &&
      datesAndTimes.some((occurence) => Boolean(occurence.conflict) && !occurence.isConflictOK);

    const regex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    const isTimesInValid = datesAndTimes.some(
      (dateTime) => !regex.test(dateTime.startTime) || !regex.test(dateTime.endTime)
    );

    return !isTimesInValid && !isConflictHard;
  };

  render() {
    const { activity, currentUser, resources, tc, t } = this.props;
    const { role } = this.context;

    if (!currentUser || !activity) {
      return <Loader />;
    }

    if (activity.authorId !== currentUser._id && role !== 'admin') {
      return <Alert message={tc('message.access.deny')} />;
    }

    const {
      datesAndTimes,
      isDeleteModalOn,
      isDeleted,
      isExclusiveActivity,
      isPublicActivity,
      isRegistrationDisabled,
      isSuccess,
      isUpdating,
      images,
    } = this.state;

    if (isSuccess) {
      return <Navigate to={`/activities/${activity._id}/info`} />;
    }
    if (isDeleted) {
      if (activity.isPublicActivity) {
        <Navigate to="activities" />;
      } else {
        <Navigate to="calendar" />;
      }
    }

    const isFormValid = this.isFormValid();

    return (
      <Box>
        <FormTitle context="activities" />
        <Template>
          <Box>
            <VStack mb="8" spacing="2">
              <FormSwitch
                isChecked={isPublicActivity}
                label={t('form.switch.public')}
                onChange={this.handlePublicActivitySwitch}
              />

              <FormSwitch
                isChecked={isExclusiveActivity}
                label={t('form.switch.exclusive')}
                onChange={this.handleExclusiveSwitch}
              />

              {isPublicActivity && (
                <FormSwitch
                  isChecked={!isRegistrationDisabled}
                  label={t('form.switch.rsvp')}
                  onChange={this.handleRegistrationSwitch}
                />
              )}
            </VStack>

            <ActivityForm
              datesAndTimes={datesAndTimes}
              defaultValues={activity}
              images={images?.map((image) => image.src)}
              isPublicActivity={isPublicActivity}
              resources={resources}
              onRemoveImage={this.handleRemoveImage}
              onSortImages={this.handleSortImages}
              onSubmit={this.handleSubmit}
              setDatesAndTimes={this.setDatesAndTimes}
              setSelectedResource={this.handleSelectedResource}
              setUploadableImages={this.setUploadableImages}
              isButtonDisabled={!isFormValid || isUpdating}
              isSubmitting={isUpdating}
              isFormValid={isFormValid}
            />
          </Box>

          <Center p="4">
            <Button colorScheme="red" size="sm" variant="ghost" onClick={this.showDeleteModal}>
              {tc('actions.remove')}
            </Button>
          </Center>

          <ConfirmModal
            title={tc('actions.submit')}
            visible={isDeleteModalOn}
            onConfirm={this.deleteActivity}
            onCancel={this.hideDeleteModal}
            confirmText={tc('modals.confirm.delete.yes')}
          >
            {tc('modals.confirm.delete.body', {
              domain: tc('domains.activity').toLowerCase(),
            })}
          </ConfirmModal>
        </Template>
      </Box>
    );
  }
}

EditActivity.contextType = StateContext;

export default EditActivity;
