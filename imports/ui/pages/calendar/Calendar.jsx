import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import moment from 'moment';
import {
  Box,
  Button,
  Center,
  Flex,
  Link as CLink,
  Tag as CTag,
  TagLabel,
  Text,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import ArrowForwardIcon from 'lucide-react/dist/esm/icons/move-right';
import parseHtml from 'html-react-parser';
import { Helmet } from 'react-helmet';
import { stringify } from 'query-string';
import AutoCompleteSelect from 'react-select';
import makeAnimated from 'react-select/animated';

import CalendarView from './CalendarView';
import ConfirmModal from '../../generic/ConfirmModal';
import Tag from '../../generic/Tag';
import {
  call,
  getNonComboResourcesWithColor,
  getComboResourcesWithColor,
  parseAllBookingsWithResources,
} from '../../utils/shared';
import { StateContext } from '../../LayoutContainer';
import PageHeading from '../../listing/PageHeading';
import Loader from '../../generic/Loader';

const animatedComponents = makeAnimated();
const maxResourceLabelsToShow = 13;

function Calendar({ tc }) {
  const [activities, setActivities] = useState([]);
  const [resources, setResources] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [calendarFilter, setCalendarFilter] = useState(null);
  const { canCreateContent, currentHost, currentUser, role } = useContext(StateContext);
  const navigate = useNavigate();

  const activitiesParsed = useMemo(
    () => parseAllBookingsWithResources(activities, resources),
    [activities, resources]
  );

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    const isPortalHost = Boolean(currentHost?.isPortalHost);
    try {
      const activitiesResponse = isPortalHost
        ? await call('getAllActivitiesFromAllHosts')
        : await call('getAllActivities');
      const resourcesResponse = isPortalHost
        ? await call('getResourcesFromAllHosts')
        : await call('getResources');
      setActivities(activitiesResponse);
      setResources(resourcesResponse);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectActivity = (activity, e) => {
    e.preventDefault();
    setSelectedActivity(activity);
  };

  const handleSelectSlot = (slotInfo) => {
    if (!canCreateContent || !slotInfo) {
      return;
    }

    const selectedResource = resources.find(
      (resource) => calendarFilter && resource._id === calendarFilter._id
    );

    if (slotInfo?.slots?.length === 1) {
      // One day selected in month view
      const type = 'month-oneday';
      setSelectedSlot({
        ...slotInfo,
        type,
        content: moment(slotInfo?.start).format('DD MMMM'),
        bookingUrl: parseDatesForQuery(slotInfo, selectedResource, type),
      });
    } else if (
      // Multiple days selected in month view
      slotInfo?.slots?.length > 1 &&
      moment(slotInfo?.end).format('HH:mm') === '00:00'
    ) {
      const type = 'month-multipledays';
      setSelectedSlot({
        ...slotInfo,
        type,
        content:
          moment(slotInfo?.start).format('DD MMMM') +
          ' – ' +
          moment(slotInfo?.end).add(-1, 'days').format('DD MMMM'),
        bookingUrl: parseDatesForQuery(slotInfo, selectedResource, type),
      });
    } else {
      // All other, i.e. weekly, daily bookings
      const type = 'other';
      setSelectedSlot({
        ...slotInfo,
        type,
        content:
          moment(slotInfo?.start).format('DD MMMM') +
          ': ' +
          moment(slotInfo?.start).format('HH:mm') +
          ' – ' +
          moment(slotInfo?.end).format('HH:mm'),
        bookingUrl: parseDatesForQuery(slotInfo, selectedResource, type),
      });
    }
  };

  const activateRedirectToBooking = () => {
    setSelectedSlot({
      ...selectedSlot,
      isRedirectActive: true,
    });
  };

  const getActivityTimes = (activity) => {
    if (!activity) {
      return '';
    }
    if (activity.startDate === activity.endDate) {
      return `${activity.startTime}–${activity.endTime} ${moment(activity.startDate).format(
        'DD MMMM'
      )}`;
    }
    return `${moment(activity.startDate).format('DD MMM')} ${activity.startTime} – ${moment(
      activity.endDate
    ).format('DD MMM')} ${activity.endTime}`;
  };

  const isCreatorOrAdmin = () => {
    return (
      (selectedActivity && currentUser && currentUser.username === selectedActivity.authorName) ||
      role === 'admin'
    );
  };

  const handlePrimaryButtonClick = () => {
    const isSameHost = selectedActivity.host === currentHost.host;

    if (selectedActivity.isGroupMeeting) {
      if (isSameHost) {
        navigate(`/groups/${selectedActivity.groupId}/info`);
        return;
      }
      window.location.href = `https://${selectedActivity.host}/groups/${selectedActivity.groupId}/info`;
      return;
    }
    if (isSameHost) {
      navigate(`/activities/${selectedActivity.activityId}/info`);
      return;
    }
    window.location.href = `https://${selectedActivity.host}/activities/${selectedActivity.activityId}/info`;
  };

  const handleSecondaryButtonClick = () => {
    if (!isCreatorOrAdmin()) {
      setSelectedActivity(null);
      return;
    }

    if (selectedActivity.isGroupMeeting) {
      navigate(`/groups/${selectedActivity.groupId}/edit`);
    } else {
      navigate(`/activities/${selectedActivity.activityId}/edit`);
    }
  };

  if (isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  const filteredActivities = activitiesParsed.filter((activity) => {
    return (
      !calendarFilter ||
      calendarFilter._id === activity.resourceId ||
      calendarFilter._id === activity.comboResourceId
    );
  });

  const nonComboResources = resources.filter((resource) => !resource.isCombo);
  const nonComboResourcesWithColor = getNonComboResourcesWithColor(nonComboResources);

  const comboResources = resources.filter((resource) => resource.isCombo);
  const comboResourcesWithColor = getComboResourcesWithColor(
    comboResources,
    nonComboResourcesWithColor
  );

  const allFilteredActsWithColors = filteredActivities.map((act, i) => {
    const resource = nonComboResourcesWithColor.find((res) => res._id === act.resourceId);
    const resourceColor = (resource && resource.color) || '#484848';

    return {
      ...act,
      resourceColor,
    };
  });

  if (selectedSlot?.bookingUrl && selectedSlot?.isRedirectActive) {
    return <Navigate to={selectedSlot.bookingUrl} />;
  }

  const selectFilterView =
    nonComboResourcesWithColor.filter((r) => r.isBookable)?.length >= maxResourceLabelsToShow;

  const allResourcesForSelect = [...comboResourcesWithColor, ...nonComboResourcesWithColor].filter(
    (r) => r.isBookable
  );

  const { settings } = currentHost;
  const calendarInMenu = settings?.menu.find((item) => item.name === 'calendar');
  const heading = calendarInMenu?.label;
  const description = calendarInMenu?.description;

  return (
    <Box>
      <Helmet>
        <title>{heading}</title>
      </Helmet>

      <PageHeading description={description} heading={heading} />

      <Box>
        <Center mb="2">
          {!selectFilterView ? (
            <Box>
              <Wrap justify="center" px="1" pb="1" mb="3">
                <WrapItem>
                  <Tag
                    alignSelf="center"
                    checkable
                    key="All"
                    label={tc('labels.all')}
                    filterColor="#484848"
                    checked={!calendarFilter}
                    onClick={() => setCalendarFilter(null)}
                  />
                </WrapItem>

                {nonComboResourcesWithColor
                  .filter((r) => r.isBookable)
                  .map((resource, i) => (
                    <WrapItem key={resource._id}>
                      <Tag
                        checkable
                        label={resource.label}
                        filterColor={resource.color}
                        checked={calendarFilter?._id === resource._id}
                        onClick={() => setCalendarFilter(resource)}
                      />
                    </WrapItem>
                  ))}
              </Wrap>
              <Wrap justify="center" mb="2" px="1">
                {comboResourcesWithColor
                  .filter((r) => r.isBookable)
                  .map((resource, i) => (
                    <WrapItem key={resource._id}>
                      <Tag
                        checkable
                        label={resource.label}
                        filterColor={'#2d2d2d'}
                        gradientBackground={resource.color}
                        checked={calendarFilter?._id === resource._id}
                        onClick={() => setCalendarFilter(resource)}
                      />
                    </WrapItem>
                  ))}
              </Wrap>
            </Box>
          ) : (
            <Flex w="30rem" align="center">
              <Button
                colorScheme="green"
                mr="2"
                size="sm"
                variant={calendarFilter ? 'outline' : 'solid'}
                onClick={() => setCalendarFilter(null)}
              >
                {tc('labels.all')}
              </Button>

              <Box w="100%">
                <AutoCompleteSelect
                  isClearable
                  onChange={(value) => setCalendarFilter(value)}
                  components={animatedComponents}
                  value={calendarFilter}
                  options={allResourcesForSelect}
                  getOptionValue={(option) => option._id}
                  style={{ width: '100%', marginTop: '1rem' }}
                  styles={{
                    option: (styles, { data }) => ({
                      ...styles,
                      borderLeft: `8px solid ${data.color}`,
                      // background: data.color.replace('40%', '90%'),
                      paddingLeft: !data.isCombo && 6,
                      fontWeight: data.isCombo ? 'bold' : 'normal',
                    }),
                  }}
                />
              </Box>
            </Flex>
          )}
        </Center>

        <Box mb="4">
          <CalendarView
            activities={allFilteredActsWithColors}
            onSelect={handleSelectActivity}
            onSelectSlot={handleSelectSlot}
          />
        </Box>
      </Box>

      <ConfirmModal
        visible={Boolean(selectedActivity)}
        title={selectedActivity && selectedActivity.title}
        confirmText={tc('actions.entryPage')}
        cancelText={isCreatorOrAdmin() ? tc('actions.update') : tc('actions.close')}
        onConfirm={() => handlePrimaryButtonClick()}
        onCancel={() => handleSecondaryButtonClick()}
        onOverlayClick={() => setSelectedActivity(null)}
      >
        <Box bg="gray.100" style={{ fontFamily: 'Courier, monospace' }} p="2" my="1">
          <div>
            <Link to={`/@${selectedActivity?.authorName}`}>
              <CLink as="span" fontWeight="bold">
                {selectedActivity && selectedActivity.authorName}
              </CLink>{' '}
            </Link>
            <Text as="span">{tc('labels.booked')}</Text>{' '}
            <Link to={`/resources/${selectedActivity?.resourceId}`}>
              <CLink as="span" fontWeight="bold">
                {selectedActivity && selectedActivity.resource}
              </CLink>
            </Link>
          </div>
          <Text>{getActivityTimes(selectedActivity)}</Text>
        </Box>

        <Text fontSize="sm" mt="2" p="1">
          {selectedActivity?.longDescription &&
            (selectedActivity?.isGroupPrivate ? '' : parseHtml(selectedActivity?.longDescription))}
        </Text>

        {/* {!selectedActivity?.isGroupPrivate && (
            <Center>
              <Link to={selectedLinkForModal}>
                <Button size="sm" as="span" rightIcon={<ArrowForwardIcon />} variant="ghost">
                  {' '}
                  {tc('actions.entryPage')}
                </Button>
              </Link>
            </Center>
          )} */}
      </ConfirmModal>

      <ConfirmModal
        visible={Boolean(selectedSlot)}
        title={`${tc('labels.newBooking')}?`}
        confirmText={
          <span>
            {tc('actions.create')} <ArrowForwardIcon />
          </span>
        }
        cancelText={tc('actions.close')}
        onConfirm={activateRedirectToBooking}
        onCancel={() => setSelectedSlot(null)}
        onClickOutside={() => setSelectedSlot(null)}
      >
        <Box bg="light-1" p="1" my="1">
          <Box>
            <CTag mr="2">
              <TagLabel>
                {calendarFilter ? calendarFilter?.label : tc('labels.unselected')}
              </TagLabel>
            </CTag>
            <Text as="span" fontWeight="bold">
              {selectedSlot?.content}
            </Text>
          </Box>
        </Box>
      </ConfirmModal>
    </Box>
  );
}

function parseDatesForQuery(slotInfo, selectedResource, type) {
  let bookingUrl = '/activities/new/?';
  const params = {
    startDate: moment(slotInfo?.start).format('YYYY-MM-DD'),
    endDate: moment(slotInfo?.end).format('YYYY-MM-DD'),
    startTime: moment(slotInfo?.start).format('HH:mm'),
    endTime: moment(slotInfo?.end).format('HH:mm'),
    resource: selectedResource ? selectedResource._id : '',
  };

  if (type !== 'other') {
    params.endDate = moment(slotInfo?.end).add(-1, 'days').format('YYYY-MM-DD');
    params.endTime = '23:59';
  }

  bookingUrl += stringify(params);
  return bookingUrl;
}

export default Calendar;
