import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
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
  Text,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

import FancyDate from '../../../entry/FancyDate';
import Modal from '../../../generic/Modal';
import OccurrenceRsvpContent from './OccurrenceRsvpContent';
import { accordionProps } from '../../../utils/constants/general';

if (Meteor.isClient) {
  import 'react-table/react-table.css';
}

const { buttonProps, itemProps, panelProps } = accordionProps;

function AccordionDates({ activity, onCloseModal }) {
  const [t] = useTranslation('activities');

  if (!activity) {
    return null;
  }

  const noReg = activity.isRegistrationDisabled || !activity.isPublicActivity;

  if (!activity.datesAndTimes || activity.datesAndTimes.length < 1) {
    return null;
  }

  const items = activity.datesAndTimes;

  if (noReg) {
    return (
      <Box>
        {activity.isRegistrationDisabled ? (
          <Text mb="2" mt="4" size="sm" textAlign="center">
            {t('public.register.disabled.true')}
          </Text>
        ) : null}

        <Box>
          {items.map((occurrence) => (
            <Box {...buttonProps} p="2">
              <FancyDate occurrence={occurrence} />
            </Box>
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {items.length > 1 && (
        <Text mb="2" mt="4" size="sm" textAlign="center">
          {t('public.register.disabled.false')}
        </Text>
      )}
      <Accordion allowToggle index={items.length === 1 ? 0 : null}>
        {items.map((occurrence, occurrenceIndex) => (
          <AccordionItem key={occurrence.startDate + occurrence.startTime} {...itemProps}>
            <AccordionButton {...buttonProps}>
              <Box flex="1" textAlign="left">
                <FancyDate occurrence={occurrence} />
              </Box>
              <AccordionIcon />
            </AccordionButton>

            <AccordionPanel {...panelProps}>
              <Text m="2" fontWeight="bold">
                {t('public.register.label')}
              </Text>
              <Box px="2">
                <OccurrenceRsvpContent
                  activity={activity}
                  occurrence={occurrence}
                  occurrenceIndex={occurrenceIndex}
                  onCloseModal={onCloseModal}
                />
              </Box>
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Box>
  );
}

function SubInfo({ occurrence }) {
  const [t] = useTranslation('activities');

  if (!occurrence) {
    return null;
  }

  return (
    <Center>
      <Flex color="gray.100" mt="2">
        <Text fontSize="sm" mr="2" mt="-1px">
          {t('label.next')}:
        </Text>

        <Text fontSize="sm" fontWeight="bold">
          {dayjs(occurrence?.startDate).format('DD')} {dayjs(occurrence?.startDate).format('MMM')}
        </Text>
      </Flex>
    </Center>
  );
}

export default function RsvpHandler({ activity }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [t] = useTranslation('activities');

  if (!activity) {
    return null;
  }

  const noReg = activity.isRegistrationDisabled || !activity.isPublicActivity;

  return (
    <>
      <Box>
        <Center>
          <Button
            borderColor="green.200"
            borderWidth="2px"
            colorScheme="green"
            height="48px"
            size="lg"
            width="240px"
            onClick={() => setModalOpen(true)}
          >
            {noReg ? t('public.labels.dates') : t('public.labels.datesAndRegistration')}
          </Button>
        </Center>

        <SubInfo occurrence={activity.datesAndTimes[0]} />
      </Box>

      <Modal
        isOpen={modalOpen}
        size="lg"
        title={noReg ? t('public.labels.dates') : t('public.labels.datesAndRegistration')}
        onCancel={() => setModalOpen(false)}
        onClose={() => setModalOpen(false)}
      >
        <AccordionDates activity={activity} onCloseModal={() => setModalOpen(false)} />
      </Modal>
    </>
  );
}
