import { Meteor } from 'meteor/meteor';
import React from 'react';
// import PropTypes from 'prop-types';

import ChatteryWindow from './ChatteryWindow';
import ChatteryInput from './ChatteryInput';

if (Meteor.isClient) {
  import './chattery.css';
}

const noMemberText = 'If you want to participate to the discussion, please join the group.';

export default function Chattery({ messages, onNewMessage, removeNotification, withInput, meta }) {
  return (
    <div className="chattery-main-container">
      <ChatteryWindow
        messages={messages}
        meta={meta || null}
        removeNotification={removeNotification}
      />
      {withInput ? (
        <ChatteryInput onNewMessage={onNewMessage} />
      ) : (
        <p style={{ padding: 24, textAlign: 'center' }}>{noMemberText}</p>
      )}
    </div>
  );
}

// Chattery.propTypes = {
//   messages: PropTypes.array.isRequired,
//   onNewMessage: PropTypes.func.isRequired,
//   meta: PropTypes.object,
// };
