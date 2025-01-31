import React from 'react';

import ChatteryBubble from './ChatteryBubble';

class ChatteryWindow extends React.Component {
  constructor(props) {
    super(props);
    this.chatWindow = React.createRef();
  }

  componentDidMount() {
    this.scrollBottom();
  }

  componentDidUpdate() {
    this.scrollBottom();
  }

  scrollBottom = () => {
    const chatWindow = this.chatWindow.current;
    chatWindow.scrollTop = chatWindow.scrollHeight;
  };

  render() {
    const { removeNotification } = this.props;
    return (
      <div className="chattery-window-container">
        <div className="chattery-window" ref={this.chatWindow}>
          {this.props.messages?.map((message, index) => (
            <ChatteryBubble
              key={message.content.substring(0, 2) + index}
              createdDate={message.createdDate}
              senderUsername={message.senderUsername}
              isSeen={Boolean(message.isSeen)}
              isFromMe={message.isFromMe}
              removeNotification={() => removeNotification(index)}
            >
              {message.content}
            </ChatteryBubble>
          ))}
        </div>
      </div>
    );
  }
}

// ChatteryWindow.propTypes = {
//   messages: PropTypes.array.isRequired,
//   meta: PropTypes.object,
// };

export default ChatteryWindow;
