import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactTable from 'react-table';
import { Box, Button, Center, Code, Flex, Heading, Text } from '@chakra-ui/react';
import moment from 'moment';
import 'react-table/react-table.css';
import Select from 'react-select';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';

import Drawer from '../generic/Drawer';
import { call } from '../utils/shared';
import { message } from '../generic/message';

function compareDatesForSort(a, b) {
  const dateA = new Date(`${a.startDate}T${a.startTime}:00Z`);
  const dateB = new Date(`${b.startDate}T${b.startTime}:00Z`);
  return dateB - dateA;
}

function UsageReport({ user, onClose }) {
  const [activities, setActivities] = useState(null);
  const [totalHours, setTotalHours] = useState(null);
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
      if (response && response.length === 0) {
        message.error(t('message.usage.noUsage'));
        return;
      }
      parseActivities(response);
    } catch (error) {
      console.log(error);
      message.error(error);
    }
  };

  const parseActivities = (response) => {
    const allParsedActivities = [];
    const usedResources = [];
    response.forEach((a, index) => {
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
            <Link target="_blank" to={`/activities/${a._id}`}>
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
    const hours = [];
    let monthCounter = 0;
    let total = 0;
    allParsedActivitiesSorted.forEach((a, i) => {
      const previous = allParsedActivitiesSorted[i - 1];
      if (i === 0 || a?.startDate?.substring(0, 7) === previous?.startDate?.substring(0, 7)) {
        total += a.consumption;
        allParsedActivitiesSortedInMonths[monthCounter].push(a);
      } else {
        total = a.consumption;
        allParsedActivitiesSortedInMonths.push([a]);
        monthCounter += 1;
      }
      hours[monthCounter] = total;
    });

    setActivities(allParsedActivitiesSortedInMonths);
    setTotalHours(hours);
  };

  const handleSelectResource = (selectedResource) => {
    setSelectedResource(selectedResource);
  };

  const onCloseDrawer = () => {
    setActivities(null);
    setTotalHours(null);
    setSelectedResource(null);
    onClose();
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
      onClose={onCloseDrawer}
    >
      {activities.map((activitiesPerMonth, index) => {
        const firstAct = activitiesPerMonth[0];
        const key = firstAct?.startDate + firstAct?.startTime + firstAct?.resourceId;
        return (
          <Box
            key={key}
            mt="8"
            pb="8"
            // ref={(element) => (this.printableElement = element)}
          >
            <Heading size="md" mb="2">
              {moment(activitiesPerMonth[0]?.startDate).format('MMMM YYYY')}:{' '}
              <Code fontSize="xl" fontWeight="bold">{`${totalHours && totalHours[index]} `}</Code>{' '}
              {t('report.table.total')}
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
              ]}
            />
            <Center p="2">
              <CSVLink
                data={activitiesPerMonth}
                filename={`${user.username}_${activitiesPerMonth[0]?.startDate.substring(0, 7)}_${
                  selectedResource ? selectedResource.label : 'all-resources'
                }`}
                target="_blank"
              >
                <Button as="span" size="sm">
                  {tc('actions.downloadCSV')}
                </Button>
              </CSVLink>
            </Center>
          </Box>
        );
      })}
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
