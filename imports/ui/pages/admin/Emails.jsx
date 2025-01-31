import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  InputGroup,
  InputRightAddon,
  VStack,
} from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Template from '../../layout/Template';
import { call } from '../../utils/shared';
import Loader from '../../generic/Loader';
import { message, Alert } from '../../generic/message';
import { StateContext } from '../../LayoutContainer';
import FormField from '../../forms/FormField';
import { defaultEmails } from '../../../startup/constants';
import ReactQuill from '../../forms/Quill';
import { AdminMenu } from './Settings';

function Emails() {
  const [loading, setLoading] = useState(true);
  const [emails, setEmails] = useState([]);
  const { currentUser, role } = useContext(StateContext);
  const [t] = useTranslation('admin');
  const [tc] = useTranslation('common');

  useEffect(() => {
    getEmails();
  }, []);

  const getEmails = async () => {
    try {
      const savedEmails = await call('getEmails');
      if (savedEmails) {
        setEmails(savedEmails);
      }
      setLoading(false);
    } catch (error) {
      setEmails(defaultEmails);
      console.log(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!currentUser || role !== 'admin') {
    return <Alert>{tc('message.access.deny')}</Alert>;
  }

  if (!emails) {
    return 'no data';
  }

  const handleSubmit = async (values, emailIndex) => {
    try {
      await call('updateEmail', emailIndex, values);
      getEmails();
      message.success(tc('message.success.update'));
    } catch (error) {
      message.error(error.reason || error.error);
    } finally {
      setLoading(false);
    }
  };

  const parsedEmails = emails.map((e, i) => {
    const key = i === 2 ? 'admin' : i === 1 ? 'cocreator' : 'participant';
    return {
      ...e,
      title: t(`emails.${key}.title`),
    };
  });

  return (
    <>
      <Template heading={t('emails.label')} leftContent={<AdminMenu />}>
        {parsedEmails?.map((email, index) => (
          <Box key={email.title} py="4" mb="4">
            <Heading size="md" mb="4">
              {email.title}
            </Heading>
            <EmailForm onSubmit={(values) => handleSubmit(values, index)} defaultValues={email} />
          </Box>
        ))}
      </Template>
    </>
  );
}

function EmailForm({ defaultValues, onSubmit }) {
  const { control, handleSubmit, register, formState } = useForm({
    defaultValues,
  });
  const [t] = useTranslation('admin');
  const [tc] = useTranslation('common');

  const { isDirty, isSubmitting } = formState;

  return (
    <Box>
      <form onSubmit={handleSubmit((data) => onSubmit(data))}>
        <VStack spacing="4">
          <FormField label={t('emails.form.subject.label')}>
            <Input {...register('subject')} placeholder={t('emails.form.subject.holder')} />
          </FormField>

          <FormField label={t('emails.form.appeal.label')}>
            <InputGroup w="280px">
              <Input {...register('appeal')} placeholder={t('emails.form.appeal.holder')} />
              <InputRightAddon children={t('emails.form.appeal.addon')} />
            </InputGroup>
          </FormField>

          <FormField label={t('emails.form.body.label')}>
            <Controller
              control={control}
              name="body"
              render={({ field }) => <ReactQuill {...field} />}
            />
          </FormField>

          <Flex justify="flex-end" py="2" w="100%">
            <Button isDisabled={!isDirty} isLoading={isSubmitting} type="submit">
              {tc('actions.submit')}
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  );
}

export default Emails;
