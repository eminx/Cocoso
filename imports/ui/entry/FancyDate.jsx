import React from 'react';
import { Flex } from '@chakra-ui/react';
import dayjs from 'dayjs';

const fancyDateStyle = {
  alignItems: 'flex-end',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: `'Raleway', sans-serif`,
  fontWeight: 'bold',
  justifyContent: 'space-between',
  lineHeight: 1,
  width: '100%',
};

function DateJust({ children, ...otherProps }) {
  return (
    <div {...otherProps}>
      <div style={{ ...fancyDateStyle, fontSize: 24 }}>{dayjs(children).format('DD')}</div>
      <div style={{ ...fancyDateStyle, fontSize: 17 }}>{dayjs(children).format('MMM')}</div>
    </div>
  );
}

function FancyDate({ occurrence, resources, ...otherProps }) {
  if (!occurrence) {
    return null;
  }
  return (
    <Flex justifyContent="space-between" p="1" mb="1" {...otherProps}>
      <div style={{ flexGrow: 1 }}>
        {occurrence.startDate === occurrence.endDate ? (
          <DateJust>{occurrence.startDate}</DateJust>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DateJust style={{ paddingRight: 12 }}>{occurrence.startDate}</DateJust>
            {' – '}
            <DateJust style={{ paddingLeft: 12 }}>{occurrence.endDate}</DateJust>
          </div>
        )}
      </div>
      <div style={fancyDateStyle}>
        <div>
          {occurrence.startTime} – {occurrence.endTime}
        </div>
        {resources && (
          <div
            style={{
              fontWeight: 300,
              maxWidth: 120,
              marginTop: 12,
              textAlign: 'right',
            }}
          >
            <em>
              {resources.map((place) => place.label).includes(occurrence.resource)
                ? `${occurrence.resource}`
                : occurrence.resource}
            </em>
          </div>
        )}
      </div>
    </Flex>
  );
}

export { DateJust };
export default FancyDate;
