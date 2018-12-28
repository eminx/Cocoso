import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { Redirect } from 'react-router-dom';
import { Row, Col, Alert, Tag, Button, Modal } from 'antd/lib';
import { PulseLoader } from 'react-spinners';
import CalendarView from '../UIComponents/CalendarView';
import colors from '../constants/colors';
import PublicActivityThumb from '../UIComponents/PublicActivityThumb';

const yesterday = moment(new Date()).add(-1, 'days');

class Home extends React.Component {
  state = {
    mode: 'list',
    editBooking: null,
    calendarFilter: 'All rooms',
    selectedBooking: null
  };

  handleModeChange = e => {
    const mode = e.target.value;
    this.setState({ mode });
  };

  handleSelectBooking = (booking, e) => {
    e.preventDefault();
    this.setState({
      selectedBooking: booking
    });
  };

  handleCalendarFilterChange = value => {
    this.setState({
      calendarFilter: value
    });
  };

  handleCloseModal = () => {
    this.setState({
      selectedBooking: null
    });
  };

  handleEditBooking = () => {
    this.setState({
      editBooking: true
    });
  };

  getBookingTimes = booking => {
    if (!booking) {
      return '';
    }
    if (booking.startDate === booking.endDate) {
      return `${booking.startTime}–${booking.endTime} ${moment(
        booking.startDate
      ).format('DD MMMM')}`;
    }
    return (
      moment(booking.startDate).format('DD MMM') +
      ' ' +
      booking.startTime +
      ' – ' +
      moment(booking.endDate).format('DD MMM') +
      ' ' +
      booking.endTime
    );
  };

  isCreator = () => {
    const { currentUser } = this.props;
    const { selectedBooking } = this.state;

    if (!selectedBooking || !currentUser) {
      return false;
    }

    if (
      selectedBooking &&
      currentUser &&
      currentUser.username === selectedBooking.authorName
    ) {
      return true;
    }
  };

  render() {
    const { isLoading, currentUser, bookingsList } = this.props;
    const { editBooking, selectedBooking } = this.state;

    if (editBooking) {
      return <Redirect to={`/edit-booking/${selectedBooking._id}`} />;
    }

    const centerStyle = {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: 24
    };

    const publicActivities = bookingsList.filter(
      activity => activity.isPublicActivity === true
    );

    return (
      <div style={{ padding: 24 }}>
        {currentUser && currentUser.isRegisteredMember && (
          <Row gutter={24}>
            <div style={centerStyle}>
              <Link to="/new-booking">
                <Button type="primary">New Booking</Button>
              </Link>
            </div>
          </Row>
        )}

        <Row gutter={24}>
          <div
            style={{
              justifyContent: 'center',
              display: 'flex',
              marginBottom: 50
            }}
          >
            <div style={{ maxWidth: 900, width: '100%' }}>
              {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <PulseLoader color="#ea3924" />
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                  {publicActivities.map(activity => (
                    <PublicActivityThumb key={activity.title} item={activity} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Row>
      </div>
    );
  }
}

export default Home;
