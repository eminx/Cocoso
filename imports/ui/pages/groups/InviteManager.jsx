import React, { PureComponent } from 'react';
import {
  Box,
  Button,
  Heading,
  Input,
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
  VStack,
} from '@chakra-ui/react';

import FormField from '../../forms/FormField';
import { emailIsValid, includesSpecialCharacters } from '../../utils/shared';
import { message } from '../../generic/message';

class InviteManager extends PureComponent {
  state = {
    emailInput: '',
    firstNameInput: '',
  };

  isAlreadyInvited = () => {
    const { emailInput } = this.state;
    const { group, t } = this.props;
    const peopleInvited = group.peopleInvited;
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
  };

  handleSendInvite = (event) => {
    event.preventDefault();
    if (this.isAlreadyInvited() || this.isValuesInvalid()) {
      return;
    }

    const { emailInput, firstNameInput } = this.state;
    const { group, t } = this.props;

    const person = {
      firstName: firstNameInput,
      email: emailInput,
    };

    Meteor.call('invitePersonToPrivateGroup', group._id, person, (error, respond) => {
      if (error) {
        console.log('error', error);
        message.error(error.reason);
      } else {
        message.success(t('invite.success', { name: firstNameInput }));
        this.setState({
          firstNameInput: '',
          emailInput: '',
        });
      }
    });
  };

  handleRemoveInvite = (person) => {
    const { group, t } = this.props;

    Meteor.call('removePersonFromInvitedList', group._id, person, (error, respond) => {
      if (error) {
        console.log('error', error);
        message.error(error.error);
      } else {
        message.success(t('invite.remove.success'));
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
    const { emailInput, peopleToBeInvited, firstNameInput } = this.state;
    const { group, t } = this.props;
    const peopleInvited = group.peopleInvited;

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
              <Tag
                key={person.email}
                borderRadius="full"
                colorScheme="green"
                mb="2"
                px="4"
                py="2"
                variant="solid"
              >
                <TagLabel fontWeight="bold" mr="2">
                  {person.firstName}
                </TagLabel>
                <Text>{person.email}</Text>
                <TagCloseButton onClick={() => this.handleRemoveInvite(person)} />
              </Tag>
            ))}
          </EmailsContainer>
        </Box>
      </Box>
    );
  }
}

const EmailsContainer = (props) => (
  <Box>
    <Heading size="md" mb="4">
      {props.title} ({props.count})
    </Heading>
    <Box>{props.children}</Box>
  </Box>
);

export default InviteManager;
