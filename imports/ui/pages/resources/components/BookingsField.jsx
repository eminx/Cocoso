import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import moment from 'moment';

import { useForm } from 'react-hook-form';
import { useCounter } from 'rooks';
import {
  Box,
  Flex,
  Text,
  Button,
  Textarea,
  Switch,
  FormControl,
  FormLabel,
  Code,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Input,
} from '@chakra-ui/react';
import AddIcon from 'lucide-react/dist/esm/icons/plus-square';
import MinusIcon from 'lucide-react/dist/esm/icons/minus-square';

import { call } from '../../../utils/shared';
import NiceList from '../../../generic/NiceList';
import { message } from '../../../generic/message';
import DateTimePicker from '../../../generic/DateTimePicker';
import { StateContext } from '../../../LayoutContainer';
import useCollisionPrevention from '../../../../api/_utils/useCollisionPrevention';

const today = new Date().toISOString().substring(0, 10);

const datesModel = {
  startDate: today,
  endDate: today,
  startTime: '08:00',
  endTime: '16:00',
};

export default function BookingsField({ currentUser, selectedResource }) {
  const { role, canCreateContent } = useContext(StateContext);
  const isAdmin = role === 'admin';
  const { value: counterValue, increment } = useCounter(1);

  if (!currentUser || !canCreateContent) {
    return null;
  }

  const [resourceBookingsForUser, setResourceBookingsForUser] = useState([]);
  const [newBooking, setNewBooking] = useState(datesModel);
  const [multipledays, setMultipledays] = useState(false);
  const [isAccordionOpen, setAccordionOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { formState, handleSubmit, register } = useForm();
  const { isDirty, isSubmitting } = formState;

  const selectedBookings = [newBooking];
  const { selectedBookingsWithConflict, isCollisionPreventionLoading } = useCollisionPrevention(
    selectedResource,
    selectedBookings,
    counterValue
  );

  const [t] = useTranslation('resources');
  const [tc] = useTranslation('common');

  useEffect(() => {
    getResourceBookingsForUser();
  }, []);

  const getResourceBookingsForUser = async () => {
    try {
      const response = await call('getResourceBookingsForUser', selectedResource?._id);
      setResourceBookingsForUser(
        response
          .map((booking) => ({
            ...booking,
            actions: [
              {
                content: tc('labels.remove'),
                handleClick: () => removeBooking(booking._id),
              },
            ],
          }))
          .reverse()
      );
      setIsLoading(false);
    } catch (error) {
      message.error(error.reason);
      setIsLoading(true);
    }
  };

  const removeBooking = async (bookingId) => {
    if (!isAdmin) {
      message.error(tc('message.access.deny'));
      return;
    }
    try {
      await call('deleteActivity', bookingId);
      message.success(tc('message.success.remove'));
      getResourceBookingsForUser();
    } catch (error) {
      message.error(error.reason);
    }
  };

  const handleDateAndTimeChange = (value, key) => {
    setNewBooking(value);
    increment();
  };

  const onSubmit = async (values) => {
    !multipledays
      ? (values = { ...newBooking, endDate: newBooking.startDate, ...values })
      : (values = { ...newBooking, ...values });

    activityValues = {
      title: values.title,
      longDescription: values.description,
      resource: selectedResource.label,
      resourceId: selectedResource._id,
      resourceIndex: selectedResource.resourceIndex,
      datesAndTimes: [
        {
          startDate: values.startDate,
          startTime: values.startTime,
          endDate: values.endDate,
          endTime: values.endTime,
        },
      ],
      isPublicActivity: false,
      isRegistrationDisabled: true,
    };

    try {
      await call('createActivity', activityValues);
      setNewBooking(datesModel);
      setMultipledays(false);
      message.success(tc('message.success.create'));
      setAccordionOpen(false);
      getResourceBookingsForUser();
    } catch (error) {
      message.error(error.reason);
    }
  };

  const isConflict = Boolean(
    selectedBookingsWithConflict && selectedBookingsWithConflict[0]?.conflict
  );

  return (
    <Box>
      {!resourceBookingsForUser ||
        (resourceBookingsForUser.length === 0 && (
          <Box>
            <Text fontSize="sm" mb="4" textAlign="center">
              {tc('bookings.empty')}
            </Text>
          </Box>
        ))}
      <Box>
        <Accordion
          index={[isAccordionOpen ? 0 : null]}
          allowMultiple
          allowToggle
          mb="8"
          onChange={() => setAccordionOpen(!isAccordionOpen)}
        >
          <AccordionItem>
            {({ isExpanded }) => (
              <>
                <AccordionButton
                  _hover={{ bg: 'brand.100' }}
                  _expanded={{ bg: 'brand.500', color: 'white' }}
                  bg="brand.50"
                  color="brand.800"
                >
                  <Box flex="1" textAlign="left">
                    {t('booking.labels.form')}
                  </Box>
                  {isExpanded ? <MinusIcon fontSize="12px" /> : <AddIcon fontSize="12px" />}
                </AccordionButton>
                <AccordionPanel bg="brand.100" pb={4}>
                  <FormControl display="flex" alignItems="center" mb="2">
                    <Switch
                      id="book-multiple-days"
                      size="sm"
                      onChange={() => setMultipledays(!multipledays)}
                    />
                    <FormLabel htmlFor="book-multiple-days" fontSize="sm" mb="0" ml="2">
                      {t('booking.multiple')}
                    </FormLabel>
                  </FormControl>

                  <Box
                    p={isConflict ? '2' : '0'}
                    mb="4"
                    border={isConflict ? '1px solid red' : 'none'}
                  >
                    <DateTimePicker
                      isRange={multipledays}
                      value={newBooking}
                      onChange={handleDateAndTimeChange}
                    />

                    {isConflict && (
                      <ConflictMarker newBooking={selectedBookingsWithConflict[0]} t={t} />
                    )}
                  </Box>

                  <form onSubmit={handleSubmit((data) => onSubmit(data))}>
                    <Input
                      {...register('title')}
                      placeholder={t('booking.title')}
                      size="sm"
                      mb="4"
                    />

                    <Textarea
                      {...register('description')}
                      placeholder={t('booking.description')}
                      size="sm"
                      mb="4"
                    />

                    <Flex justify="flex-end">
                      <Button
                        colorScheme="green"
                        isDisabled={!isDirty || isConflict}
                        isLoading={isSubmitting}
                        size="sm"
                        type="submit"
                      >
                        {t('booking.submit')}
                      </Button>
                    </Flex>
                  </form>
                </AccordionPanel>
              </>
            )}
          </AccordionItem>
        </Accordion>
      </Box>

      {!isLoading && (
        <Box mt="2">
          {resourceBookingsForUser && resourceBookingsForUser.length > 0 && (
            <NiceList actionsDisabled={!isAdmin} list={resourceBookingsForUser}>
              {(booking) => (
                <Box p="2">
                  <Text fontSize="sm">
                    {`From ${moment(booking.startDate).format('ddd, D MMM')} ${booking.startTime} 
                    to ${
                      booking.startDate === booking.endDate
                        ? ''
                        : moment(booking.endDate).format('ddd, D MMM')
                    } ${booking.endTime} `}
                  </Text>
                </Box>
              )}
            </NiceList>
          )}
        </Box>
      )}
    </Box>
  );
}

function ConflictMarker({ newBooking, t }) {
  if (!newBooking.conflict) {
    return null;
  }

  return (
    <Box mt="4">
      <Text fontSize="sm" textAlign="center" fontWeight="bold">
        {t('booking.conflict')}
      </Text>
      <Code colorScheme="red" mx="auto" display="block" width="fit-content" mt="4">
        {newBooking.conflict.startDate === newBooking.conflict.endDate
          ? newBooking.conflict.startDate
          : `${newBooking.conflict.startDate}-${newBooking.conflict.endDate}`}
        {', '}
        {`${newBooking.conflict.startTime} – ${newBooking.conflict.endTime}`}
      </Code>
    </Box>
  );
}
