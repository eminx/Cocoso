import React, { PureComponent } from 'react';
import { Navigate } from 'react-router-dom';
import moment from 'moment';
import i18n from 'i18next';
import { Box, VStack } from '@chakra-ui/react';
import { parse } from 'query-string';
import arrayMove from 'array-move';

import ActivityForm from '../../forms/ActivityForm';
import Template from '../../layout/Template';
import { message, Alert } from '../../generic/message';
import FormSwitch from '../../forms/FormSwitch';
import {
  call,
  compareDatesWithStartDateForSort,
  checkAndSetBookingsWithConflict,
  getAllBookingsWithSelectedResource,
  resizeImage,
  uploadImage,
} from '../../utils/shared';
import { StateContext } from '../../LayoutContainer';
import FormTitle from '../../forms/FormTitle';

const defaultCapacity = 40;
const today = new Date().toISOString().substring(0, 10);
const emptyDateAndTime = {
  startDate: today,
  endDate: today,
  startTime: '00:00',
  endTime: '23:59',
  attendees: [],
  capacity: defaultCapacity,
  isRange: false,
  conflict: null,
};

class NewActivity extends PureComponent {
  state = {
    formValues: null,
    datesAndTimes: null,
    isCreating: false,
    isLoading: false,
    isSuccess: false,
    isError: false,
    newActivityId: null,
    uploadableImages: [],
    uploadableImagesLocal: [],
    isPublicActivity: false,
    isExclusiveActivity: true,
    isRegistrationDisabled: false,
    isReady: false,
  };

  componentDidMount() {
    this.setInitialValuesWithQueryParams();
  }

  componentDidUpdate(prevProps, prevState) {
    const { location, resources } = this.props;

    const { search } = location;
    const prevSearch = prevProps.location.search;
    if (search !== prevSearch || resources?.length !== prevProps.resources?.length) {
      this.setInitialValuesWithQueryParams();
    }
  }

  setInitialValuesWithQueryParams = () => {
    const { location, resources } = this.props;
    const { formValues } = this.state;

    const { search } = location;
    const params = parse(search);

    if (!params) {
      this.setState({
        isReady: true,
      });
      return;
    }

    const defaultBooking = {
      ...emptyDateAndTime,
      ...params,
      isRange: params?.startDate && params?.endDate && params.startDate !== params.endDate,
    };

    const initialValues = {
      ...formValues,
      resourceId: params.resource,
    };

    const selectedResource = resources?.find((r) => r._id === params.resource);

    this.setState(
      {
        formValues: initialValues,
        datesAndTimes: [defaultBooking],
        selectedResource,
        isReady: true,
      },
      () => {
        setTimeout(() => {
          this.validateBookings();
        }, 800);
      }
    );
  };

  handleSubmit = (values) => {
    const { tc } = this.props;
    const { isPublicActivity, uploadableImages, selectedResource } = this.state;
    const formValues = {
      ...values,
      resource: selectedResource?.label,
      resourceIndex: selectedResource?.resourceIndex,
    };
    if (selectedResource) {
      (formValues.resource = selectedResource?.label),
        (formValues.resourceIndex = selectedResource.resourceIndex);
    }

    if (isPublicActivity && (!uploadableImages || uploadableImages.length === 0)) {
      message.error(tc('message.error.imageRequired'));
      return;
    }

    this.setState(
      {
        isCreating: true,
        formValues,
      },
      () => {
        if (isPublicActivity) {
          this.uploadImages();
        } else {
          this.createActivity();
        }
      }
    );
  };

  successCreation = () => {
    const { tc } = this.props;
    message.success(tc('message.success.create'));
  };

  createActivity = async (imagesReadyToSave) => {
    const {
      datesAndTimes,
      formValues,
      isExclusiveActivity,
      isPublicActivity,
      isRegistrationDisabled,
    } = this.state;

    const datesAndTimesNoConflict = datesAndTimes.map((item) => ({
      startDate: item.startDate,
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      isRange: item.isRange,
      capacity: item.capacity,
      attendees: [],
    }));

    const datesAndTimesNoConflictSorted = datesAndTimesNoConflict.sort(
      compareDatesWithStartDateForSort
    );

    const values = {
      ...formValues,
      datesAndTimes: datesAndTimesNoConflictSorted,
      isExclusiveActivity,
      isPublicActivity,
      isRegistrationDisabled,
      images: imagesReadyToSave,
    };

    try {
      const newActivityId = await call('createActivity', values);
      this.setState(
        {
          isCreating: false,
          newActivityId,
          isSuccess: true,
        },
        () => this.successCreation()
      );
    } catch (error) {
      message.error(error.error || error.reason);
      this.setState({
        isCreating: false,
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
    const { resources } = this.props;
    const selectedResource = resources.find((r) => r._id === value);
    this.setState(
      {
        selectedResource,
      },
      () => {
        this.validateBookings();
      }
    );
  };

  validateBookings = () => {
    const { allBookings } = this.props;
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
      allBookingsWithSelectedResource
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

    const isConflictHard = datesAndTimes.some(
      (occurence) => Boolean(occurence.conflict) && !occurence.isConflictOK
    );

    const regex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
    const isTimesInValid = datesAndTimes.some(
      (dateTime) => !regex.test(dateTime.startTime) || !regex.test(dateTime.endTime)
    );

    return !isTimesInValid && !isConflictHard;
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

  uploadImages = async () => {
    const { uploadableImages } = this.state;
    this.setState({
      isCreating: true,
    });

    try {
      const imagesReadyToSave = await Promise.all(
        uploadableImages.map(async (uploadableImage, index) => {
          const resizedImage = await resizeImage(uploadableImage, 1200);
          const uploadedImage = await uploadImage(resizedImage, 'activityImageUpload');
          return uploadedImage;
        })
      );
      this.createActivity(imagesReadyToSave);
    } catch (error) {
      console.error('Error uploading:', error);
      message.error(error.reason);
      this.setState({
        isCreating: false,
        isError: true,
      });
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
    const { currentUser, resources, t, tc } = this.props;
    const { canCreateContent } = this.context;

    if (!currentUser || !canCreateContent) {
      return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Alert
            message={tc('message.access.contributor', {
              domain: 'an activity',
            })}
            type="error"
          />
        </div>
      );
    }

    const {
      datesAndTimes,
      formValues,
      isSuccess,
      isCreating,
      isPublicActivity,
      isExclusiveActivity,
      isReady,
      isRegistrationDisabled,
      newActivityId,
      uploadableImageLocal,
      uploadableImagesLocal,
    } = this.state;

    if (isSuccess) {
      return <Navigate to={`/activities/${newActivityId}`} />;
    }

    if (!isReady) {
      return null;
    }

    const isFormValid = this.isFormValid();

    return (
      <Box>
        <FormTitle context="activities" isCalendar={!isPublicActivity} isNew />
        <Template>
          <Box>
            <Box mb="8">
              <VStack spacing="2">
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
            </Box>

            <ActivityForm
              datesAndTimes={datesAndTimes}
              defaultValues={formValues}
              images={uploadableImagesLocal}
              isButtonDisabled={!isFormValid || isCreating}
              isSubmitting={isCreating}
              isNew
              isPublicActivity={isPublicActivity}
              resources={resources}
              uploadableImageLocal={uploadableImageLocal}
              onRemoveImage={this.handleRemoveImage}
              onSubmit={this.handleSubmit}
              setDatesAndTimes={this.setDatesAndTimes}
              setUploadableImage={this.setUploadableImage}
              setUploadableImages={this.setUploadableImages}
              setSelectedResource={this.handleSelectedResource}
              onSortImages={this.handleSortImages}
            />
          </Box>
        </Template>
      </Box>
    );
  }
}

NewActivity.contextType = StateContext;

export default NewActivity;
