import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from 'react-table';
import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import moment from 'moment';
import 'react-table/react-table.css';
import Select from 'react-select';
// import ReactToPrint from 'react-to-print';
import { useTranslation } from 'react-i18next';

import Drawer from './Drawer';
import Modal from './Modal';
import { call } from '../utils/shared';
import { message } from './message';

function compareDatesForSort(a, b) {
  const dateA = new Date(`${a.startDate}T${a.startTime}:00Z`);
  const dateB = new Date(`${b.startDate}T${b.startTime}:00Z`);
  return dateB - dateA;
}

function UsageReport({ user, onClose }) {
  const [activities, setActivities] = useState(null);
  const [activityDetails, setActivityDetails] = useState(null);
  const [resources, setResources] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);

  const [tc] = useTranslation('common');
  const [t] = useTranslation('members');

  useEffect(() => {
    getActivitiesbyUserId();
  }, [user, selectedResource]);

  const getActivitiesbyUserId = async () => {
    if (!user) {
      return;
    }
    try {
      const response = await call('getActivitiesbyUserId', user.id);
      parseActivities(response);
    } catch (error) {
      console.log(error);
      message.error(error);
    }
  };

  const parseActivities = (activities) => {
    const allParsedActivities = [];
    const usedResources = [];
    activities.forEach((a, index) => {
      if (!usedResources.find((r) => r.value === a.resourceId)) {
        usedResources.push({
          label: a.resource,
          value: a.resourceId,
        });
      }
      a.datesAndTimes.forEach((d, i) => {
        let consumption = moment(d.endDate + ' ' + d.endTime).diff(
          moment(d.startDate + ' ' + d.startTime),
          'hours',
          true
        );
        if ((consumption % 1).toFixed(2) === '0.98') {
          consumption = Math.ceil(consumption);
        }
        allParsedActivities.push({
          ...d,
          title: (
            <Link target="_blank" to={`/activity/${a._id}`}>
              <Button colorScheme="blue" variant="link" as="span">
                {a.title}
              </Button>
            </Link>
          ),
          start: d.startDate + ' ' + d.startTime,
          end: d.endDate + ' ' + d.endTime,
          resource: a.resource,
          resourceId: a.resourceId,
          consumption,
        });
      });
    });

    setResources(usedResources);

    const allParsedActivitiesSorted = allParsedActivities
      .filter((a) => (selectedResource ? a.resourceId === selectedResource.value : true))
      .sort(compareDatesForSort);

    const allParsedActivitiesSortedInMonths = [[]];
    let monthCounter = 0;
    allParsedActivitiesSorted.forEach((a, i) => {
      const previous = i > 0 && allParsedActivitiesSorted[i - 1];
      if (a?.startDate?.substring(0, 7) === previous?.startDate?.substring(0, 7)) {
        allParsedActivitiesSortedInMonths[monthCounter].push(a);
      } else {
        allParsedActivitiesSortedInMonths.push([a]);
        monthCounter += 1;
      }
    });

    setActivities(allParsedActivitiesSortedInMonths);
  };

  const handleSelectResource = (selectedResource) => {
    setSelectedResource(selectedResource);
  };

  if (!user || !activities) {
    return null;
  }

  return (
    <Drawer
      bg="gray.100"
      isOpen={Boolean(activities)}
      size="xl"
      title={
        <Title
          resources={resources}
          username={user.username}
          value={selectedResource}
          onChange={handleSelectResource}
        />
      }
      onClose={onClose}
    >
      {activities.map(
        (activitiesPerMonth, index) =>
          index !== 0 && (
            <Box
              key={activitiesPerMonth[0]?.startDate}
              mt="8"
              pb="8"
              // ref={(element) => (this.printableElement = element)}
            >
              <Heading size="md" mb="2">
                {moment(activitiesPerMonth[0]?.startDate).format('MMMM YYYY')}
              </Heading>
              <ReactTable
                size="sm"
                data={activitiesPerMonth}
                columns={[
                  {
                    Header: t('report.table.title'),
                    accessor: 'title',
                  },
                  {
                    Header: t('report.table.resource'),
                    accessor: 'resource',
                  },
                  {
                    Header: t('report.table.start'),
                    accessor: 'start',
                  },
                  {
                    Header: t('report.table.end'),
                    accessor: 'end',
                  },
                  {
                    Header: t('report.table.consumption'),
                    accessor: 'consumption',
                  },
                  // {
                  //   // Header: t('public.register.form.name.last'),
                  //   Header: 'Occurences',
                  //   accessor: 'occurences',
                  // },
                ]}
              />
              {/* <ReactToPrint
                trigger={() => <Button onClick={() => setPrintableMonth(index)} size="sm">{tc('actions.print')}</Button>}
                content={() => this.printableElement}
                pageStyle={{ margin: 144 }}
              /> */}
            </Box>
          )
      )}
    </Drawer>
  );
}

function Title({ username, resources, onChange, value }) {
  const [t] = useTranslation('members');

  return (
    <Flex align="center" w="100%" wrap="wrap">
      <Heading size="md" mr="4" mb="2">
        {t('report.title', { username: username })}
      </Heading>
      <Text w="240px" size="md">
        <Select
          isClearable
          isSearchable
          name="resource"
          options={resources}
          size="sm"
          value={value}
          onChange={onChange}
        />
      </Text>
    </Flex>
  );
}

export default UsageReport;
