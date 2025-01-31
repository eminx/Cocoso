import React from 'react';
import { Box, Button, Center } from '@chakra-ui/react';
import ReactTable from 'react-table';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';

const getFileName = (occurrence, title) => {
  if (occurrence.startDate !== occurrence.endDate) {
    return `${title} | ${occurrence.startDate}-${occurrence.endDate}, ${occurrence.startTime}-${occurrence.endTime}`;
  }
  return `${title} | ${occurrence.startDate}, ${occurrence.startTime}-${occurrence.endTime}`;
};

export default function RsvpList({ occurrence, title }) {
  const [t] = useTranslation('activities');
  const [tc] = useTranslation('common');

  if (!occurrence) {
    return null;
  }

  const { attendees } = occurrence;

  return (
    <Box>
      <Center p="2">
        <CSVLink data={attendees} filename={getFileName(occurrence, title)} target="_blank">
          <Button as="span" size="sm">
            {tc('actions.downloadCSV')}
          </Button>
        </CSVLink>
      </Center>
      <ReactTable
        data={attendees}
        columns={[
          {
            Header: t('public.register.form.name.first'),
            accessor: 'firstName',
          },
          {
            Header: t('public.register.form.name.last'),
            accessor: 'lastName',
          },
          {
            Header: t('public.register.form.people.label'),
            accessor: 'numberOfPeople',
          },
          {
            Header: t('public.register.form.email'),
            accessor: 'email',
          },
        ]}
      />
    </Box>
  );
}
