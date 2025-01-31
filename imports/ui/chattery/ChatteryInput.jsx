import React from 'react';
// import PropTypes from 'prop-types';
import i18n from 'i18next';

class ChatteryInput extends React.Component {
  state = {
    inputValue: '',
  };

  onChange = (event) => {
    this.setState({
      inputValue: event.target.value,
    });
  };

  onSubmit = (event) => {
    event.preventDefault();
    const { inputValue } = this.state;
    if (inputValue !== '') {
      this.setState(
        {
          inputValue: '',
        },
        () => this.props.onNewMessage(inputValue)
      );
    }
  };

  render() {
    return (
      <div className="chattery-inputform-container">
        <form className="chattery-inputform" autoComplete="off" onSubmit={this.onSubmit}>
          <textarea
            type="text"
            className="chattery-input"
            value={this.state.inputValue}
            onChange={this.onChange}
          />

          <input
            type="submit"
            className="chattery-submitbutton"
            value={i18n.t('common:actions.send')}
          />
        </form>
      </div>
    );
  }
}

// ChatteryInput.propTypes = {
//   onNewMessage: PropTypes.func.isRequired,
// };

export default ChatteryInput;
