import React, { useContext, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Select,
  Switch,
  Text,
  Textarea,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import DateTimePicker from '../../../../forms/DateTimePicker';
import { ConflictMarker } from '../../../../forms/DatesAndTimes';
import {
  call,
  checkAndSetBookingsWithConflict,
  getAllBookingsWithSelectedResource,
  parseAllBookingsWithResources,
} from '../../../../utils/shared';
import Modal from '../../../../generic/Modal';
import { StateContext } from '../../../../LayoutContainer';
import { GroupContext } from '../../Group';

const today = dayjs();

const emptyDateAndTime = {
  startDate: today,
  endDate: today,
  startTime: '00:00',
  endTime: '23:59',
  attendees: [],
  capacity: 40,
  isRange: false,
  conflict: null,
};

export default function AddMeeting({ onClose }) {
  const [state, setState] = useState({
    activities: [],
    conflictingBooking: null,
    isFormValid: false,
    isSubmitted: false,
    newMeeting: emptyDateAndTime,
    resources: [],
  });
  const { group, getGroupById } = useContext(GroupContext);
  const { currentHost } = useContext(StateContext);
  const [t] = useTranslation('groups');
  const { activities, conflictingBooking, isFormValid, newMeeting, resources } = state;

  const getData = async () => {
    try {
      const activitiesReceived = await call('getAllActivities');
      const resourcesReceived = await call('getResources');
      setState({
        ...state,
        activities: activitiesReceived,
        resources: resourcesReceived,
      });
    } catch (error) {
      // console.log(error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    validateBookings();
  }, [newMeeting]);

  const handleDateAndTimeChange = (date) => {
    setState({
      ...state,
      newMeeting: date,
    });
  };

  const validateBookings = () => {
    if (!activities || !resources) {
      return null;
    }

    const selectedResource = resources.find((r) => r._id === newMeeting.resourceId);

    if (!newMeeting || !newMeeting.startDate || !newMeeting.startTime || !newMeeting.endTime) {
      setState({
        ...state,
        conflictingBooking: null,
        isFormValid: false,
      });
      return;
    }

    if (!newMeeting.resourceId) {
      setState({
        ...state,
        conflictingBooking: null,
        isFormValid: true,
      });
      return;
    }

    const allBookingsParsed = parseAllBookingsWithResources(activities, resources);

    const allBookingsWithSelectedResource = getAllBookingsWithSelectedResource(
      selectedResource,
      allBookingsParsed
    );

    const selectedBookingsWithConflict = checkAndSetBookingsWithConflict(
      [
        {
          startDate: newMeeting.startDate,
          endDate: newMeeting.startDate,
          startTime: newMeeting.startTime,
          endTime: newMeeting.endTime,
        },
      ],
      allBookingsWithSelectedResource
    );

    if (
      selectedBookingsWithConflict &&
      selectedBookingsWithConflict[0] &&
      selectedBookingsWithConflict[0].conflict
    ) {
      setState({
        ...state,
        conflictingBooking: selectedBookingsWithConflict && selectedBookingsWithConflict[0],
        isFormValid: false,
      });
    } else {
      setState({
        ...state,
        conflictingBooking: null,
        isFormValid: true,
      });
    }
  };

  const handleResourceChange = (resourceLabel) => {
    const selectedResource = resources.find((r) => r.label === resourceLabel);

    setState({
      ...state,
      newMeeting: {
        ...newMeeting,
        resource: resourceLabel,
        resourceId: selectedResource ? selectedResource._id : null,
        resourceIndex: selectedResource ? selectedResource.resourceIndex : null,
      },
    });
  };

  const createActivity = async () => {
    if (!isFormValid) {
      return;
    }

    if (!newMeeting.resource || newMeeting.resource.length < 4) {
      // message.error(t('errors.noresource'));
      // console.log('no resource');
      return;
    }

    setState({
      ...state,
      isSubmitted: true,
    });

    const activityValues = {
      title: group.title,
      subTitle: group.readingMaterial,
      longDescription: group.description,
      images: [group.imageUrl],
      resource: newMeeting.resource,
      resourceId: newMeeting.resourceId,
      resourceIndex: newMeeting.resourceIndex,
      datesAndTimes: [
        {
          startDate: newMeeting.startDate,
          endDate: newMeeting.startDate,
          startTime: newMeeting.startTime,
          endTime: newMeeting.endTime,
          attendees: [],
          capacity: group.capacity,
        },
      ],
      isPublicActivity: false,
      isRegistrationDisabled: false,
      isGroupMeeting: true,
      isGroupPrivate: group.isPrivate,
      groupId: group._id,
    };

    try {
      await call('createActivity', activityValues);
      getGroupById();
      setState({
        ...state,
        isSubmitted: false,
      });
      onClose();
      // message.success(tc('message.success.create'));
    } catch (error) {
      // console.log(error);
      // message.error(error.reason);
    }
  };

  return (
    <Modal bg="gray.100" isOpen title={t('meeting.form.label')} onClose={onClose}>
      <AddMeetingForm
        buttonDisabled={!isFormValid}
        conflictingBooking={conflictingBooking}
        hostname={currentHost?.settings?.name}
        newMeeting={newMeeting}
        resources={resources?.filter((r) => r.isBookable)}
        handleDateChange={handleDateAndTimeChange}
        handleResourceChange={handleResourceChange}
        handleSubmit={createActivity}
      />
    </Modal>
  );
}

function AddMeetingForm({
  buttonDisabled,
  conflictingBooking,
  hostname,
  newMeeting,
  resources,
  handleDateChange,
  handleResourceChange,
  handleSubmit,
}) {
  const [isLocal, setIsLocal] = useState(true);
  const [t] = useTranslation('groups');

  return (
    <>
      <Box bg="gray.100" borderRadius="8px" p="4">
        <Text textAlign="center">{t('meeting.info.admin')}</Text>
        <DateTimePicker value={newMeeting} onChange={handleDateChange} />

        <FormControl alignItems="center" display="flex" my="4">
          <Switch
            id="is-local-switch"
            isChecked={isLocal}
            onChange={({ target: { checked } }) => setIsLocal(checked)}
          />
          <FormLabel htmlFor="is-local-switch" mb="1" ml="2">
            {t('meeting.form.switch', { place: hostname })}
          </FormLabel>
        </FormControl>

        {isLocal ? (
          <Select
            name="resource"
            placeholder={t('meeting.form.resource')}
            onChange={({ target: { value } }) => handleResourceChange(value)}
          >
            {resources.map((r) => (
              <option key={r._id}>{r.label}</option>
            ))}
          </Select>
        ) : (
          <Textarea
            placeholder={t('meeting.form.location')}
            size="sm"
            onChange={(event) => handleResourceChange(event.target.value)}
          />
        )}
      </Box>

      <Flex justify="flex-end" pt="4">
        <Button isDisabled={buttonDisabled} onClick={handleSubmit}>
          {t('meeting.form.submit')}
        </Button>
      </Flex>

      {conflictingBooking && <ConflictMarker recurrence={conflictingBooking} t={t} />}
    </>
  );
}
