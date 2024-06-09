import React, { PureComponent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import moment from 'moment';
import i18n from 'i18next';
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
import { ArrowForwardIcon } from '@chakra-ui/icons';
import renderHTML from 'react-render-html';
import { Helmet } from 'react-helmet';
import { stringify } from 'query-string';
import AutoCompleteSelect from 'react-select';
import makeAnimated from 'react-select/animated';

import CalendarView from '../components/CalendarView';
import ConfirmModal from '../components/ConfirmModal';
import Tag from '../components/Tag';
import {
  call,
  getNonComboResourcesWithColor,
  getComboResourcesWithColor,
  parseAllBookingsWithResources,
} from '../utils/shared';
import { StateContext } from '../LayoutContainer';
import PageHeading from '../components/PageHeading';
import Loader from '../components/Loader';

moment.locale(i18n.language);
const animatedComponents = makeAnimated();
const maxResourceLabelsToShow = 13;

class Calendar extends PureComponent {
  state = {
    activities: [],
    calendarFilter: null,
    editActivity: null,
    isLoading: true,
    mode: 'list',
    resources: [],
    selectedActivity: null,
    selectedResource: null,
    selectedSlot: null,
  };

  componentDidMount() {
    this.getData();
  }

  getData = async () => {
    const { currentHost } = this.context;
    const { isPortalHost } = currentHost;
    try {
      const allActivities = isPortalHost
        ? await call('getAllActivitiesFromAllHosts')
        : await call('getAllActivities');
      const resources = isPortalHost
        ? await call('getResourcesFromAllHosts')
        : await call('getResources');

      const activities = parseAllBookingsWithResources(allActivities, resources);
      this.setState({
        activities,
        resources,
        isLoading: false,
      });
    } catch (error) {
      console.log(error);
    }
  };

  handleModeChange = (e) => {
    const mode = e.target.value;
    this.setState({ mode });
  };

  handleSelectActivity = (activity, e) => {
    e.preventDefault();
    this.setState({
      selectedActivity: activity,
    });
  };

  handleCalendarFilterChange = (value, meta) => {
    this.setState({ calendarFilter: value });
  };

  handleCloseModal = () => {
    this.setState({
      selectedActivity: null,
    });
  };

  handleEditActivity = () => {
    this.setState({
      editActivity: true,
    });
  };

  handleSelectSlot = (slotInfo) => {
    const { resources } = this.state;
    const { canCreateContent } = this.context;

    if (!canCreateContent) {
      return;
    }

    const { calendarFilter } = this.state;

    const selectedResource = resources.find(
      (resource) => calendarFilter && resource._id === calendarFilter._id
    );

    if (slotInfo?.slots?.length === 1) {
      // One day selected in month view
      const type = 'month-oneday';
      this.setState({
        selectedSlot: {
          ...slotInfo,
          type,
          content: moment(slotInfo?.start).format('DD MMMM'),
          bookingUrl: parseDatesForQuery(slotInfo, selectedResource, type),
        },
      });
    } else if (
      // Multiple days selected in month view
      slotInfo?.slots?.length > 1 &&
      moment(slotInfo?.end).format('HH:mm') === '00:00'
    ) {
      const type = 'month-multipledays';
      this.setState({
        selectedSlot: {
          ...slotInfo,
          type,
          content:
            moment(slotInfo?.start).format('DD MMMM') +
            ' – ' +
            moment(slotInfo?.end).add(-1, 'days').format('DD MMMM'),
          bookingUrl: parseDatesForQuery(slotInfo, selectedResource, type),
        },
      });
    } else {
      // All other, i.e. weekly, daily bookings
      const type = 'other';
      this.setState({
        selectedSlot: {
          ...slotInfo,
          type,
          content:
            moment(slotInfo?.start).format('DD MMMM') +
            ': ' +
            moment(slotInfo?.start).format('HH:mm') +
            ' – ' +
            moment(slotInfo?.end).format('HH:mm'),
          bookingUrl: parseDatesForQuery(slotInfo, selectedResource, type),
        },
      });
    }
  };

  activateRedirectToBooking = () => {
    this.setState(({ selectedSlot }) => ({
      selectedSlot: {
        ...selectedSlot,
        isRedirectActive: true,
      },
    }));
  };

  handleCloseSelectedSlot = () => {
    this.setState({ selectedSlot: null });
  };

  getActivityTimes = (activity) => {
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

  isCreator = () => {
    const { currentUser } = this.props;
    const { selectedActivity } = this.state;

    if (!selectedActivity || !currentUser) {
      return false;
    }

    if (selectedActivity && currentUser && currentUser.username === selectedActivity.authorName) {
      return true;
    }
  };

  render() {
    const { currentUser, tc } = this.props;
    const { currentHost } = this.context;
    const {
      activities,
      calendarFilter,
      editActivity,
      isLoading,
      resources,
      selectedActivity,
      selectedSlot,
    } = this.state;

    const filteredActivities = activities.filter((activity) => {
      return (
        !calendarFilter ||
        calendarFilter._id === activity.resourceId ||
        calendarFilter._id === activity.comboResourceId
      );
    });

    if (editActivity) {
      if (selectedActivity?.authorName === currentUser?.username) {
        if (selectedActivity.isGroupMeeting) {
          return <Navigate to={`/groups/${selectedActivity.groupId}/edit`} />;
        }
        return <Navigate to={`/activities/${selectedActivity.activityId}/edit`} />;
      }
    }

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

    const allResourcesForSelect = [
      ...comboResourcesWithColor,
      ...nonComboResourcesWithColor,
    ].filter((r) => r.isBookable);

    const selectedLinkForModal =
      selectedActivity &&
      (selectedActivity.isGroup || selectedActivity.isGroupMeeting
        ? `/groups/${selectedActivity.groupId}`
        : `/activities/${selectedActivity.activityId}`);

    const { settings } = currentHost;
    const title = settings?.menu.find((item) => item.name === 'calendar')?.label;

    if (isLoading) {
      return (
        <Center>
          <Loader />
        </Center>
      );
    }

    return (
      <Box>
        <Helmet>
          <title>{title}</title>
        </Helmet>

        <PageHeading
          description={settings.menu.find((item) => item.name === 'calendar')?.description}
        />

        <Box>
          <Center>
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
                      onClick={() => this.handleCalendarFilterChange(null)}
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
                          onClick={() => this.handleCalendarFilterChange(resource)}
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
                          onClick={() => this.handleCalendarFilterChange(resource)}
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
                  onClick={() => this.handleCalendarFilterChange(null)}
                >
                  {tc('labels.all')}
                </Button>

                <Box w="100%" zIndex={5}>
                  <AutoCompleteSelect
                    isClearable
                    onChange={this.handleCalendarFilterChange}
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
              onSelect={this.handleSelectActivity}
              onSelectSlot={this.handleSelectSlot}
            />
          </Box>
        </Box>

        <ConfirmModal
          visible={Boolean(selectedActivity)}
          title={selectedActivity && selectedActivity.title}
          confirmText={tc('actions.update')}
          cancelText={tc('actions.close')}
          onConfirm={this.handleEditActivity}
          onCancel={this.handleCloseModal}
          confirmButtonProps={
            (!this.isCreator() || selectedActivity.isGroup) && {
              style: { display: 'none' },
            }
          }
          onClickOutside={this.handleCloseModal}
        >
          <Box bg="gray.100" style={{ fontFamily: 'Courier, monospace' }} p="2" my="1">
            <div>
              <Link to={`/@/${selectedActivity?.authorName}`}>
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
            <Text>{this.getActivityTimes(selectedActivity)}</Text>
          </Box>

          <Text fontSize="sm" mt="2" p="1">
            {selectedActivity?.longDescription &&
              (selectedActivity?.isGroupPrivate
                ? ''
                : renderHTML(selectedActivity?.longDescription))}
          </Text>

          {!selectedActivity?.isGroupPrivate && (
            <Center>
              <Link to={selectedLinkForModal}>
                <Button size="sm" as="span" rightIcon={<ArrowForwardIcon />} variant="ghost">
                  {' '}
                  {tc('actions.entryPage')}
                </Button>
              </Link>
            </Center>
          )}
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
          onConfirm={this.activateRedirectToBooking}
          onCancel={this.handleCloseSelectedSlot}
          onClickOutside={this.handleCloseSelectedSlot}
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

Calendar.contextType = StateContext;

export default Calendar;
