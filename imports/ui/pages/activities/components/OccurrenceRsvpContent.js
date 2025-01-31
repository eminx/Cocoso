import React, { useState, useContext } from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import { StateContext } from '../../../LayoutContainer';
import { ActivityContext } from '../Activity';
import Modal from '../../../generic/Modal';
import FancyDate from '../../../entry/FancyDate';
import RsvpForm from './RsvpForm';
import RsvpList from './CsvList';
import { call } from '../../../utils/shared';
import { message } from '../../../generic/message';

const yesterday = dayjs(new Date()).add(-1, 'days');

export default function RsvpContent({ activity, occurrence, occurrenceIndex, onCloseModal }) {
  const [state, setState] = useState({
    isRsvpCancelModalOn: false,
    rsvpCancelModalInfo: null,
    selectedOccurrence: null,
  });
  const [capacityGotFullByYou] = useState(false);
  const [t] = useTranslation('activities');
  const { canCreateContent, currentUser } = useContext(StateContext);
  const { getActivityById } = useContext(ActivityContext);
  const { isRsvpCancelModalOn, rsvpCancelModalInfo, selectedOccurrence } = state;

  if (!occurrence || !occurrence.attendees) {
    return null;
  }

  const eventPast = dayjs(occurrence.endDate).isBefore(yesterday);

  if (eventPast) {
    return (
      <Box py="2">
        <Text color="gray.800">{t('public.past')}</Text>
      </Box>
    );
  }

  const getTotalNumber = () => {
    let counter = 0;
    occurrence.attendees.forEach((attendee) => {
      counter += Number(attendee.numberOfPeople);
    });
    return counter;
  };

  const resetRsvpModal = () => {
    setState({
      ...state,
      isRsvpCancelModalOn: false,
      rsvpCancelModalInfo: null,
    });
    onCloseModal();
  };

  const openCancelRsvpModal = () => {
    setState({
      ...state,
      isRsvpCancelModalOn: true,
      rsvpCancelModalInfo: {
        occurrenceIndex,
        email: currentUser ? currentUser.emails[0].address : '',
        lastName: currentUser && currentUser.lastName ? currentUser.lastName : '',
      },
    });
  };

  const handleRsvpSubmit = async (values) => {
    let isAlreadyRegistered = false;
    occurrence.attendees.forEach((attendee) => {
      if (
        attendee.lastName.trim().toLowerCase() === values.lastName.trim().toLowerCase() &&
        attendee.email.trim().toLowerCase() === values.email.trim().toLowerCase()
      ) {
        isAlreadyRegistered = true;
      }
    });
    if (isAlreadyRegistered) {
      message.error(t('public.register.alreadyRegistered'));
      return;
    }

    let registeredNumberOfAttendees = 0;
    occurrence.attendees.forEach((attendee) => {
      registeredNumberOfAttendees += attendee.numberOfPeople;
    });

    const numberOfPeople = Number(values.numberOfPeople);

    if (occurrence.capacity < registeredNumberOfAttendees + numberOfPeople) {
      const capacityLeft = occurrence.capacity - registeredNumberOfAttendees;
      message.error(t('public.register.notEnoughSeats', { capacityLeft }));
      return;
    }

    const parsedValues = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email.trim(),
      numberOfPeople,
    };

    try {
      await call('registerAttendance', activity?._id, parsedValues, occurrenceIndex);
      await getActivityById();
      resetRsvpModal();
      message.success(t('public.attendance.create'));
    } catch (error) {
      console.log(error);
      message.error(error.reason);
    }
  };

  const handleChangeRsvpSubmit = async (values) => {
    // const occurrenceIndex = rsvpCancelModalInfo?.occurrenceIndex;
    // const occurrence = activity?.datesAndTimes[occurrenceIndex];

    let registeredNumberOfAttendees = 0;
    occurrence?.attendees?.forEach((attendee, index) => {
      if (rsvpCancelModalInfo.attendeeIndex === index) {
        return;
      }
      registeredNumberOfAttendees += attendee.numberOfPeople;
    });

    const numberOfPeople = Number(values.numberOfPeople);

    if (occurrence.capacity < registeredNumberOfAttendees + numberOfPeople) {
      const capacityLeft = occurrence.capacity - registeredNumberOfAttendees;
      message.error(t('public.register.notEnoughSeats', { capacityLeft }));
      return;
    }

    const parsedValues = {
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      numberOfPeople,
    };

    try {
      await call(
        'updateAttendance',
        activity?._id,
        parsedValues,
        rsvpCancelModalInfo?.occurrenceIndex,
        rsvpCancelModalInfo?.attendeeIndex
      );
      await getActivityById();
      resetRsvpModal();
      message.success(t('public.attendance.update'));
    } catch (error) {
      console.log(error);
      message.error(error.reason);
    }
  };

  const handleRemoveRsvp = async () => {
    if (!rsvpCancelModalInfo) {
      return;
    }
    const { email, lastName } = rsvpCancelModalInfo;

    if (!email || !lastName) {
      return;
    }

    const theOccurrence = activity?.datesAndTimes[occurrenceIndex];
    const theNonAttendee = theOccurrence.attendees.find(
      (a) => a.email === email && a.lastName === lastName
    );

    if (!theNonAttendee) {
      message.error(t('public.register.notFound'));
      return;
    }

    try {
      await call('removeAttendance', activity?._id, occurrenceIndex, email, lastName);
      await getActivityById();
      resetRsvpModal();
      message.success(t('public.attendance.remove'));
      setState({
        ...state,
        rsvpCancelModalInfo: null,
        isRsvpCancelModalOn: false,
      });
    } catch (error) {
      console.log(error);
      message.error(error.reason);
    }
  };

  const findRsvpInfo = () => {
    const theOccurrence = activity?.datesAndTimes[rsvpCancelModalInfo.occurrenceIndex];

    const attendeeFinder = (attendee) =>
      attendee.lastName.trim().toLowerCase() ===
        rsvpCancelModalInfo.lastName.trim().toLowerCase() &&
      attendee.email.trim().toLowerCase() === rsvpCancelModalInfo.email.trim().toLowerCase();

    const foundAttendee = theOccurrence.attendees.find(attendeeFinder);
    const foundAttendeeIndex = theOccurrence.attendees.findIndex(attendeeFinder);

    if (!foundAttendee) {
      message.error(t('public.register.notFound'));
      alert('Attendee not found');
      return;
    }

    setState({
      ...state,
      rsvpCancelModalInfo: {
        ...rsvpCancelModalInfo,
        attendeeIndex: foundAttendeeIndex,
        isInfoFound: true,
        firstName: foundAttendee.firstName,
        numberOfPeople: foundAttendee.numberOfPeople,
      },
    });
  };

  const defaultRsvpValues = {
    firstName: currentUser ? currentUser.firstName : '',
    lastName: currentUser ? currentUser.lastName : '',
    email: currentUser ? currentUser.emails[0].address : '',
    numberOfPeople: 1,
  };

  return (
    <Box>
      <Box>
        <Center m="2">
          <Button
            colorScheme="red"
            size="sm"
            variant="ghost"
            onClick={() => openCancelRsvpModal(occurrenceIndex)}
          >
            {t('public.cancel.label')}
          </Button>
        </Center>

        {occurrence.capacity && occurrence.attendees && getTotalNumber() >= occurrence.capacity ? (
          <p>
            {capacityGotFullByYou && t('public.capacity.fullByYou')}
            {t('public.capacity.full')}
          </p>
        ) : (
          <RsvpForm
            defaultValues={defaultRsvpValues}
            onSubmit={(values) => handleRsvpSubmit(values, occurrenceIndex)}
          />
        )}
      </Box>

      {canCreateContent && (
        <Center mt="2">
          <Button size="sm" onClick={() => setState({ ...state, selectedOccurrence: occurrence })}>
            {t('public.attendance.show')}
          </Button>
        </Center>
      )}

      <Modal
        isOpen={isRsvpCancelModalOn}
        size="lg"
        title={
          rsvpCancelModalInfo && rsvpCancelModalInfo.isInfoFound
            ? t('public.cancel.found')
            : t('public.cancel.notFound')
        }
        onClose={() => setState({ ...state, isRsvpCancelModalOn: false })}
      >
        {rsvpCancelModalInfo?.isInfoFound ? (
          <RsvpForm
            isUpdateMode
            onDelete={handleRemoveRsvp}
            defaultValues={rsvpCancelModalInfo}
            onSubmit={(values) => handleChangeRsvpSubmit(values)}
          />
        ) : (
          <Box>
            <FormControl id="lastname" mb="3" size="sm">
              <FormLabel>{t('public.register.form.name.last')}</FormLabel>
              <Input
                value={rsvpCancelModalInfo && rsvpCancelModalInfo.lastName}
                onChange={(e) =>
                  setState({
                    ...state,
                    rsvpCancelModalInfo: {
                      ...rsvpCancelModalInfo,
                      lastName: e.target.value,
                    },
                  })
                }
              />
            </FormControl>

            <FormControl id="email" size="sm">
              <FormLabel>{t('public.register.form.email')}</FormLabel>
              <Input
                value={rsvpCancelModalInfo && rsvpCancelModalInfo.email}
                onChange={(e) =>
                  setState({
                    ...state,
                    rsvpCancelModalInfo: {
                      ...rsvpCancelModalInfo,
                      email: e.target.value,
                    },
                  })
                }
              />
            </FormControl>

            <Flex justify="flex-end" pt="6">
              <Button onClick={findRsvpInfo}>Confirm</Button>
            </Flex>
          </Box>
        )}
      </Modal>

      <Modal
        isOpen={Boolean(selectedOccurrence)}
        title={
          <Box mr="8">
            <FancyDate occurrence={selectedOccurrence} />
          </Box>
        }
        onClose={() => setState({ ...state, selectedOccurrence: null })}
      >
        <Box p="1">
          <Heading as="h3" mb="2" size="md">
            {t('public.attendance.label')}
          </Heading>
          <RsvpList occurrence={selectedOccurrence} title={activity?.title} />
        </Box>
      </Modal>
    </Box>
  );
}
