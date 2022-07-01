import { Meteor } from 'meteor/meteor';
import React, { PureComponent } from 'react';
import { Link, Redirect } from 'react-router-dom';
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

import Loader from '../components/Loader';
import CalendarView from '../components/CalendarView';
import ConfirmModal from '../components/ConfirmModal';
import Tag from '../components/Tag';
import { getNonComboResourcesWithColor, getComboResourcesWithColor } from '../utils/shared';
import { StateContext } from '../LayoutContainer';

const publicSettings = Meteor.settings.public;

moment.locale(i18n.language);
const animatedComponents = makeAnimated();
const maxResourceLabelsToShow = 12;

const localeSort = (a, b) => a.label.localeCompare(b.label);

class Calendar extends PureComponent {
  state = {
    calendarFilter: null,
    editActivity: null,
    selectedActivity: null,
    selectedSlot: null,
    mode: 'list',
    selectedResource: null,
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
    const { resources } = this.props;
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
    const { isLoading, currentUser, allBookings, resources, tc } = this.props;
    const { canCreateContent, currentHost, role } = this.context;
    const {
      editActivity,
      calendarFilter,
      selectedActivity,
      selectedSlot,
      isUploading,
      selectedResource,
    } = this.state;

    const filteredActivities = allBookings.filter((activity) => {
      return (
        !calendarFilter ||
        calendarFilter._id === activity.resourceId ||
        calendarFilter._id === activity.comboResourceId
      );
    });

    if (editActivity) {
      return <Redirect to={`/activities/${selectedActivity.activityId}/edit`} />;
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
      return <Redirect to={selectedSlot.bookingUrl} />;
    }

    const selectFilterView = nonComboResourcesWithColor?.length >= maxResourceLabelsToShow;

    const allResourcesForSelect = [...comboResourcesWithColor, ...nonComboResourcesWithColor];

    const selectedLinkForModal =
      selectedActivity &&
      (selectedActivity.isProcess || selectedActivity.isProcessMeeting
        ? `/processes/${selectedActivity.processId}`
        : `/activities/${selectedActivity.activityId}`);

    return (
      <Box>
        <Helmet>
          <title>{`${tc('domains.activity')} ${tc('domains.calendar')} | ${
            currentHost.settings.name
          } | ${publicSettings.name}`}</title>
        </Helmet>

        {currentUser && canCreateContent && (
          <Center mb="3">
            <Link to="/activities/new">
              <Button as="span" colorScheme="green" variant="outline" textTransform="uppercase">
                {tc('actions.create')}
              </Button>
            </Link>
          </Center>
        )}

        <Box bg="white" pt="1" mb="3">
          <Center p="2">
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

                  {nonComboResourcesWithColor.map((resource, i) => (
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
                  {comboResourcesWithColor.map((resource, i) => (
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

          {isLoading ? (
            <Loader />
          ) : (
            <Box>
              <CalendarView
                activities={allFilteredActsWithColors}
                onSelect={this.handleSelectActivity}
                onSelectSlot={this.handleSelectSlot}
              />
            </Box>
          )}
        </Box>

        <ConfirmModal
          visible={Boolean(selectedActivity)}
          title={selectedActivity && selectedActivity.title}
          confirmText={tc('actions.update')}
          cancelText={tc('actions.close')}
          onConfirm={this.handleEditActivity}
          onCancel={this.handleCloseModal}
          confirmButtonProps={
            (!this.isCreator() || selectedActivity.isProcess) && {
              style: { display: 'none' },
            }
          }
          onClickOutside={this.handleCloseModal}
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
            <Text>{this.getActivityTimes(selectedActivity)}</Text>
          </Box>

          <Text fontSize="sm" mt="2" p="1">
            {selectedActivity?.longDescription &&
              (selectedActivity?.isPrivateProcess
                ? ''
                : renderHTML(selectedActivity?.longDescription))}
          </Text>

          <Center>
            {
              <Link to={selectedLinkForModal}>
                <Button size="sm" as="span" rightIcon={<ArrowForwardIcon />} variant="ghost">
                  {' '}
                  {!selectedActivity?.isPrivateProcess &&
                    `${
                      selectedActivity?.isProcess || selectedActivity?.isProcessMeeting
                        ? tc('labels.process')
                        : tc('labels.activity')
                    }`}
                </Button>
              </Link>
            }
          </Center>
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
