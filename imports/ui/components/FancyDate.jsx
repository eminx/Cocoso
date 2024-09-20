import React from 'react';
import { Flex } from '@chakra-ui/react';
import moment from 'moment';

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
  console.log(moment?.locale());
  return (
    <div {...otherProps}>
      <div style={{ ...fancyDateStyle, fontSize: 24 }}>{moment(children).format('DD')}</div>
      <div style={{ ...fancyDateStyle, fontSize: 17 }}>{moment(children).format('MMM')}</div>
    </div>
  );
}

function FancyDate({ occurence, resources, ...otherProps }) {
  if (!occurence) {
    return null;
  }
  return (
    <Flex justifyContent="space-between" p="1" mb="1" {...otherProps}>
      <div style={{ flexGrow: 1 }}>
        {occurence.startDate === occurence.endDate ? (
          <DateJust>{occurence.startDate}</DateJust>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <DateJust style={{ paddingRight: 12 }}>{occurence.startDate}</DateJust>
            {' – '}
            <DateJust style={{ paddingLeft: 12 }}>{occurence.endDate}</DateJust>
          </div>
        )}
      </div>
      <div style={fancyDateStyle}>
        <div>
          {occurence.startTime} – {occurence.endTime}
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
              {resources.map((place) => place.label).includes(occurence.resource)
                ? `${occurence.resource}`
                : occurence.resource}
            </em>
          </div>
        )}
      </div>
    </Flex>
  );
}

export { DateJust };
export default FancyDate;
