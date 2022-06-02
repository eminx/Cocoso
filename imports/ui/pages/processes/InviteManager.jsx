import { Meteor } from 'meteor/meteor';
import React, { PureComponent } from 'react';
import { Box, Button, Heading, Input, Tag, Text, VStack } from '@chakra-ui/react';

import FormField from '../../components/FormField';
import { emailIsValid, includesSpecialCharacters } from '../../utils/shared';
import { message } from '../../components/message';

const EmailsContainer = (props) => (
  <Box>
    <Heading size="md" mb="4">
      {props.title} ({props.count})
    </Heading>
    <Box>{props.children}</Box>
  </Box>
);

class InviteManager extends PureComponent {
  state = {
    emailInput: '',
    firstNameInput: '',
  };

  isAlreadyInvited = () => {
    const { emailInput } = this.state;
    const { process, t } = this.props;
    const peopleInvited = process.peopleInvited;
    const inviteEmailsList = peopleInvited.map((person) => person.email);

    if (inviteEmailsList.indexOf(emailInput) !== -1) {
      message.error(t('invite.email.already'));
      return true;
    }

    return false;
  };

  isValuesInvalid = () => {
    const { emailInput, firstNameInput } = this.state;
    const { t } = this.props;

    if (!emailIsValid(emailInput)) {
      message.error(t('invite.email.valid'));
      return true;
    }

    if (firstNameInput.length < 2 || includesSpecialCharacters(firstNameInput)) {
      message.error(t('invite.firstName.valid'));
      return true;
    }
    return false;
  };

  handleSendInvite = (event) => {
    event.preventDefault();
    if (this.isAlreadyInvited() || this.isValuesInvalid()) {
      return;
    }

    const { emailInput, firstNameInput } = this.state;
    const { process, t } = this.props;

    const person = {
      firstName: firstNameInput,
      email: emailInput,
    };

    Meteor.call('invitePersonToPrivateProcess', process._id, person, (error) => {
      if (error) {
        message.destroy();
        message.error(error.reason);
        throw new Error(`Error: ${error}`);
      } else {
        message.success(t('invite.success', { name: firstNameInput }));
        this.setState({
          firstNameInput: '',
          emailInput: '',
        });
      }
    });
  };

  handleEmailInputChange = (event) => {
    event.preventDefault();
    this.setState({
      emailInput: event.target.value,
    });
  };

  handleFirstNameInputChange = (event) => {
    event.preventDefault();
    this.setState({
      firstNameInput: event.target.value,
    });
  };

  render() {
    const { emailInput, firstNameInput } = this.state;
    const { process, t } = this.props;
    const peopleInvited = process.peopleInvited;

    return (
      <Box>
        <VStack py="6">
          <Text>{t('invite.info')}</Text>
          <FormField label={t('invite.email.label')}>
            <Input
              onChange={this.handleEmailInputChange}
              placeholder={t('invite.email.holder')}
              value={emailInput}
            />
          </FormField>

          <FormField label={t('invite.firstName.label')}>
            <Input
              onChange={this.handleFirstNameInputChange}
              placeholder={t('invite.firstName.holder')}
              value={firstNameInput}
            />
          </FormField>

          <Button onClick={this.handleSendInvite}>{t('invite.submit')}</Button>
        </VStack>

        <Box py="6">
          <EmailsContainer title="People Invited" count={peopleInvited.length}>
            {peopleInvited.map((person) => (
              <Tag key={person.email}>
                <Text fontWeight="bold" mr="1">
                  {person.firstName}
                </Text>
                {person.email}
              </Tag>
            ))}
          </EmailsContainer>
        </Box>
      </Box>
    );
  }
}

export default InviteManager;
