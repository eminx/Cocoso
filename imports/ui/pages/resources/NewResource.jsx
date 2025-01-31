import React, { useContext } from 'react';
import { Box, Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import Template from '../../layout/Template';
import ResourceForm from './components/ResourceForm';
import { StateContext } from '../../LayoutContainer';
import { Alert } from '../../generic/message';
import FormTitle from '../../forms/FormTitle';

function NewResourcePage({ history }) {
  const [tc] = useTranslation('common');
  const { currentUser, role } = useContext(StateContext);

  const resourceModel = {
    label: '',
    description: '',
    isBookable: true,
    isCombo: false,
    resourcesForCombo: [],
  };

  if (!currentUser || role !== 'admin') {
    return (
      <Center m="8">
        <Alert message={tc('message.access.deny')} type="error" />
      </Center>
    );
  }

  return (
    <Box>
      <FormTitle context="resources" isNew />
      <Template>
        <Box>
          <ResourceForm defaultValues={resourceModel} />
        </Box>
      </Template>
    </Box>
  );
}

export default NewResourcePage;
