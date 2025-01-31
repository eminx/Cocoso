import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Center, Button } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { StateContext } from '../../LayoutContainer';
import { call } from '../../utils/shared';
import { message } from '../../generic/message';
import NotFoundPage from '../NotFoundPage';
import Template from '../../layout/Template';
import ResourceForm from './components/ResourceForm';
import ConfirmModal from '../../generic/ConfirmModal';
import { Alert } from '../../generic/message';
import FormTitle from '../../forms/FormTitle';

function EditResourcePage({ history }) {
  const { role } = useContext(StateContext);
  const { resourceId } = useParams();
  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOn, setIsDeleteModalOn] = useState(false);
  const [tc] = useTranslation('common');
  const navigate = useNavigate();

  useEffect(() => {
    getResourceById();
  }, []);

  const getResourceById = async () => {
    try {
      const response = await call('getResourceById', resourceId);
      setResource(response);
      setIsLoading(false);
    } catch (error) {
      message.error(error.reason);
      setIsLoading(false);
    }
  };

  const hideDeleteModal = () => setIsDeleteModalOn(false);
  const showDeleteModal = () => setIsDeleteModalOn(true);
  const deleteResource = async (resourceId) => {
    try {
      await call('deleteResource', resourceId);
      message.success(tc('message.success.remove'));
      navigate('/resources');
    } catch (error) {
      message.error(error.error || error.reason);
      console.log(error);
    }
  };

  if (role !== 'admin') {
    return <Alert message={tc('message.access.deny')} type="error" />;
  }

  if (typeof resource === 'undefined') {
    return <NotFoundPage domain="Resource with this name or id" />;
  }

  if (!resource) {
    return null;
  }

  return (
    <Box>
      <FormTitle context="resources" />
      <Template>
        <Box>
          {!isLoading && <ResourceForm defaultValues={resource} isEditMode history={history} />}
        </Box>
        <Center p="4">
          <Button colorScheme="red" size="sm" variant="ghost" onClick={showDeleteModal}>
            {tc('actions.remove')}
          </Button>
        </Center>
        <ConfirmModal
          confirmText={tc('modals.confirm.delete.yes')}
          visible={isDeleteModalOn}
          title={tc('modals.confirm.delete.title')}
          onCancel={hideDeleteModal}
          onConfirm={() => deleteResource(resource?._id)}
        >
          {tc('modals.confirm.delete.body', {
            domain: tc('domains.resource').toLowerCase(),
          })}
        </ConfirmModal>
      </Template>
    </Box>
  );
}

export default EditResourcePage;
