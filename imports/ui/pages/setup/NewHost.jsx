import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Center } from '@chakra-ui/react';

import NewHostForm from '../../forms/NewHostForm';
import { message, Alert } from '../../generic/message';
import { call } from '../../utils/shared';

function NewHost({ setFinished }) {
  const [t] = useTranslation('admin');
  const [tc] = useTranslation('common');

  const currentUser = Meteor.user();

  const hostModel = {
    host: window.location.host,
    name: '',
    email: currentUser?.emails && currentUser?.emails[0]?.address,
    address: '',
    city: '',
    country: '',
    about: '',
  };

  const handleSubmit = async (values) => {
    if (!currentUser.isSuperAdmin) {
      message.error(tc('message.access.deny'));
      return;
    }

    const parsedValues = {
      ...values,
      aboutTitle: `About ${values.name}`,
    };

    try {
      await call('createNewHost', parsedValues);
      window.scrollTo(0, 0);
      setFinished();
    } catch (error) {
      console.log(error.error);
      message.error(`Error: ${error.reason || error.error}`);
    }
  };

  if (!currentUser || !currentUser.isSuperAdmin) {
    return (
      <Center>
        <Alert type="error">{tc('message.access.deny')}</Alert>
      </Center>
    );
  }

  return (
    <Box>
      <NewHostForm defaultValues={hostModel} onSubmit={handleSubmit} />
    </Box>
  );
}

export default NewHost;
