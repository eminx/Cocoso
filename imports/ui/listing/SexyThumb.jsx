import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import dayjs from 'dayjs';
import { Box, Flex, HStack, Tag as CTag } from '@chakra-ui/react';
import { LazyLoadImage } from 'react-lazy-load-image-component';

import { DateJust } from '../entry/FancyDate';
import { StateContext } from '../LayoutContainer';

const isClient = Meteor?.isClient;

if (isClient) {
  import 'react-lazy-load-image-component/src/effects/black-and-white.css';
}

const yesterday = dayjs(new Date()).add(-1, 'days');
const today = dayjs(new Date());

const dateStyle = {
  fontWeight: 700,
  lineHeight: 1,
};

const imageStyle = {
  height: '325px',
  maxWidth: '780px',
  objectFit: 'cover',
  width: '100%',
  borderRadius: '8px',
};

function ThumbDate({ date }) {
  if (!date) {
    return null;
  }

  const isPast = dayjs(date.endDate)?.isBefore(yesterday);

  return (
    <Flex
      key={date.startDate + date.startTime}
      align="center"
      color={isPast ? 'gray.400' : 'white'}
    >
      <DateJust>{date.startDate}</DateJust>
      {date.startDate !== date.endDate && <span style={{ margin: '0 2px' }}>–</span>}
      {date.startDate !== date.endDate && <DateJust>{date.endDate}</DateJust>}
    </Flex>
  );
}

export default function SexyThumb({ activity, host, showPast = false }) {
  const { allHosts } = isClient && useContext(StateContext);

  if (!activity) {
    return null;
  }

  const { datesAndTimes, hostName, subTitle, tag, title } = activity;
  const imageUrl = (activity.images && activity.images[0]) || activity.imageUrl;

  const dates = datesAndTimes;

  const futureDates =
    dates &&
    dates
      .filter((date) => dayjs(date?.endDate)?.isAfter(yesterday))
      .sort((a, b) => dayjs(a?.startDate) - dayjs(b?.startDate));
  const remaining = futureDates && futureDates.length - 3;
  const pastDates =
    dates &&
    dates
      .filter((date) => dayjs(date?.startDate)?.isBefore(today))
      .sort((a, b) => dayjs(a?.startDate) - dayjs(b?.startDate));

  const hostValue =
    host && allHosts && isClient ? allHosts?.find((h) => h?.host === host)?.name : host;

  return (
    <Box
      bg="brand.500"
      border="1px solid"
      borderColor="white"
      borderRadius={8}
      h={imageStyle.height}
      className="thumb-cover-container"
      fontWeight="bold"
      maxW={imageStyle.maxWidth}
    >
      <div className="thumb-cover">
        <LazyLoadImage alt={title} effect="black-and-white" src={imageUrl} style={imageStyle} />
      </div>

      {host && (
        <Box p="1" position="absolute" right="0" top="0">
          <CTag bg="rgba(0, 0, 0, 0.5)" color="white" size="sm">
            {hostValue}
          </CTag>
        </Box>
      )}

      <div className="thumb-text-container">
        <Flex direction="column" h="100%" justify="space-between">
          <Box>
            <h3 className="thumb-title">{title}</h3>
            <h4 className="thumb-subtitle">{subTitle}</h4>
          </Box>

          {dates && (
            <div
              style={{
                alignItems: 'center',
                display: 'flex',
                flexWrap: 'wrap',
                // justifyContent: 'flex-end',
              }}
            >
              {!showPast && futureDates && (
                <HStack align="center" color="brand.50" mb="4" spacing="4">
                  {futureDates.slice(0, 3).map((date) => (
                    <ThumbDate key={date?.startDate + date?.startTime} date={date} />
                  ))}
                  {remaining > 0 && (
                    <div style={{ ...dateStyle, fontSize: 20, marginBottom: 16 }}>
                      + {remaining}
                    </div>
                  )}
                </HStack>
              )}
              {showPast && (
                <HStack spacing="4" mb="4">
                  {pastDates.slice(0, 3).map((date) => (
                    <ThumbDate
                      key={date?.startDate + date?.startTime}
                      color="gray.400"
                      date={date}
                    />
                  ))}
                </HStack>
              )}
            </div>
          )}
        </Flex>

        {(hostName || tag) && (
          <div
            style={{
              alignItems: 'center',
              bottom: 12,
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute',
              right: 12,
            }}
          >
            <em style={{ color: '#fff' }}>{hostName || tag}</em>
          </div>
        )}
      </div>
    </Box>
  );
}
