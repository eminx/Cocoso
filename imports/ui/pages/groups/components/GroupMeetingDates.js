import React, { useContext, useState } from 'react';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Center,
  Flex,
  List,
  ListItem,
  Text,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import FancyDate from '../../../entry/FancyDate';
import Modal from '../../../generic/Modal';
import { accordionProps } from '../../../utils/constants/general';
import { message } from '../../../generic/message';
import { call } from '../../../utils/shared';
import { GroupContext } from '../Group';

const { buttonProps, itemProps, panelProps } = accordionProps;

const yesterday = dayjs(new Date()).add(-1, 'days');
const isFutureMeeting = (meeting) => dayjs(meeting.endDate).isAfter(yesterday);

function MeetingDatesContent({ currentUser, group, isAdmin, isMember, onClose }) {
  const [regButtonDisabled, setRegButtonDisabled] = useState(false);
  const [delButtonDisabled, setDelButtonDisabled] = useState(false);
  const { getGroupById } = useContext(GroupContext);
  const [t] = useTranslation('groups');

  if (!group) {
    return null;
  }

  const toggleAttendance = async (activityId, meetingIndex) => {
    if (!currentUser) {
      message.error(t('meeting.access.logged'));
      return;
    }
    if (!isMember) {
      message.error(t('meeting.access.join'));
      return;
    }

    if (!group.meetings || group.meetings.length < 1) {
      return;
    }

    setRegButtonDisabled(true);

    const isAttending = group.meetings[meetingIndex].attendees
      ?.map((attendee) => attendee.username)
      ?.includes(currentUser.username);

    const meetingAttendee = {
      email: currentUser.emails[0].address,
      username: currentUser.username,
      firstName: currentUser.firstName || '',
      lastName: currentUser.lastName || '',
      numberOfPeople: 1,
    };

    if (isAttending) {
      try {
        await call(
          'removeAttendance',
          activityId,
          0,
          meetingAttendee.email,
          meetingAttendee.lastName
        );
        await getGroupById();
        setRegButtonDisabled(false);
        message.success(t('meeting.attends.remove'));
        onClose();
      } catch (error) {
        console.log('error', error);
        message.error(error.error);
      }
    } else {
      try {
        await call('registerAttendance', activityId, meetingAttendee);
        await getGroupById();
        setRegButtonDisabled(false);
        message.success(t('meeting.attends.register'));
        onClose();
      } catch (error) {
        console.log('error', error);
        message.error(error.error);
      }
    }
  };

  const deleteActivity = async (activityId) => {
    if (!isAdmin) {
      message.error(t('meeting.access.remove'));
      return;
    }

    setDelButtonDisabled(true);

    try {
      await call('deleteActivity', activityId);
      message.success(t('meeting.success.remove'));
      getGroupById();
      setDelButtonDisabled(false);
    } catch (error) {
      console.log(error);
      message.error(error.error);
    }
  };

  return (
    <Accordion allowToggle>
      {group.meetings?.map((meeting, meetingIndex) => {
        const isAttending =
          currentUser &&
          meeting.attendees &&
          meeting.attendees.map((attendee) => attendee.username).includes(currentUser.username);

        return (
          <AccordionItem
            key={meeting._id}
            {...itemProps}
            style={{
              display: isFutureMeeting(meeting) ? 'block' : 'none',
            }}
          >
            <AccordionButton {...buttonProps}>
              <Box flex="1" textAlign="left">
                <FancyDate occurrence={meeting} />
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel {...panelProps}>
              {isAdmin ? (
                <Box>
                  <Text fontWeight="bold" mt="1">
                    {t('labels.attendees')}
                  </Text>
                  <List>
                    {meeting?.attendees?.map(
                      (attendee) =>
                        attendee && (
                          <ListItem key={attendee.username} mt="2">
                            <Text as="span" fontWeight="bold">
                              {attendee.username}
                            </Text>
                            {(attendee.firstName || attendee.lastName) && (
                              <Text as="span">{` (${attendee.firstName} ${attendee.lastName})`}</Text>
                            )}
                          </ListItem>
                        )
                    )}
                  </List>

                  <Center py="2" mt="2">
                    <Button
                      colorScheme="red"
                      isLoading={delButtonDisabled}
                      size="xs"
                      variant="link"
                      onClick={() => deleteActivity(meeting.meetingId)}
                    >
                      {t('meeting.actions.remove')}
                    </Button>
                  </Center>
                </Box>
              ) : (
                <Center p="2">
                  <Button
                    size="sm"
                    colorScheme={isAttending ? 'red' : 'green'}
                    isLoading={regButtonDisabled}
                    onClick={() => toggleAttendance(meeting.meetingId, meetingIndex)}
                  >
                    {isAttending ? t('meeting.isAttending.false') : t('meeting.isAttending.true')}
                  </Button>
                </Center>
              )}
            </AccordionPanel>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

export default function GroupMeetingDates(props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [t] = useTranslation('groups');

  const { group, isMember } = props;

  if (!group) {
    return null;
  }

  const isFutureMeetings =
    group.meetings &&
    group.meetings.length > 0 &&
    group.meetings.filter((meeting) => dayjs(meeting.endDate).isAfter(yesterday)).length > 0;

  if (!isFutureMeetings) {
    return (
      <Text color="gray.100" my="2" textAlign="center">
        {t('meeting.info.empty')}
      </Text>
    );
  }

  return (
    <>
      <Center color="gray.100">
        <Box>
          <Center>
            {isMember && (
              <Button
                bg="white"
                borderColor="green.100"
                borderWidth="2px"
                colorScheme="green"
                height="48px"
                size="lg"
                variant="outline"
                width="240px"
                onClick={() => setModalOpen(true)}
              >
                {t('actions.register')}
              </Button>
            )}
          </Center>
          <Center>
            <Flex mt="2">
              <Text fontSize="sm" mr="2" mt="-1px">
                {t('labels.next_meeting')}
              </Text>

              <Text fontSize="sm" fontWeight="bold">
                {dayjs(group.meetings[0]?.startDate).format('DD')}{' '}
                {dayjs(group.meetings[0]?.startDate).format('MMM')}
              </Text>
            </Flex>
          </Center>
          <Center>
            {!isMember && (
              <Button
                color="green.200"
                fontSize="sm"
                variant="link"
                onClick={() => setModalOpen(true)}
              >
                {t('labels.meeting_dates')}
              </Button>
            )}
          </Center>
        </Box>
      </Center>

      <Modal
        h="80%"
        isCentered
        isOpen={modalOpen}
        title={t('labels.meetings')}
        onCancel={() => setModalOpen(false)}
        onClose={() => setModalOpen(false)}
      >
        {isMember && (
          <Text mb="4" textAlign="center">
            {t('meeting.info.member')}
          </Text>
        )}
        <MeetingDatesContent {...props} onClose={() => setModalOpen(false)} />
      </Modal>
    </>
  );
}
