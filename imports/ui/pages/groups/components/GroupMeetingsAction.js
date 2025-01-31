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
  FormControl,
  FormLabel,
  Heading,
  Input,
  NumberInput,
  NumberInputField,
  Stack,
  Text,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import ReactTable from 'react-table';
import { CSVLink } from 'react-csv';

import { StateContext } from '../../../LayoutContainer';
import { call } from '../../../utils/shared';
import { message } from '../../../generic/message';
import ConfirmModal from '../../../generic/ConfirmModal';
import FancyDate, { DateJust } from '../../../entry/FancyDate';
import FormField from '../../../forms/FormField';
import Modal from '../../../generic/Modal';

const yesterday = dayjs(new Date()).add(-1, 'days');

export default function GroupMeetingsAction({ group }) {
  if (!group) {
    return null;
  }

  const futureMeetings = group?.meetings?.map((meeting) =>
    dayjs(meeting.endDate).isAfter(yesterday)
  );
  if (!futureMeetings || futureMeetings.length === 0) {
    return null;
  }

  const futureMeetingsSorted = futureMeetings.sort(
    (a, b) => dayjs(a.startDate) - dayjs(b.startDate)
  );

  return (
    <Center>
      <Flex justify="center">
        {futureMeetingsSorted.map((m) => (
          <Box key={m.startDate + m.startTime} color="gray.700" px="3">
            <DateJust>{m.startDate}</DateJust>
          </Box>
        ))}
      </Flex>
    </Center>
  );
}
