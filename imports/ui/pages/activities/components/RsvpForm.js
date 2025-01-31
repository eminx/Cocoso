import React, { useState } from 'react';
import { Box, Button, Input, NumberInput, NumberInputField, Stack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '../../../forms/FormField';

export default function RsvpForm({ isUpdateMode = false, defaultValues, onSubmit, onDelete }) {
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { handleSubmit, register, formState } = useForm({
    defaultValues,
  });
  const { isDirty, isSubmitting } = formState;
  const [t] = useTranslation('activities');

  const fields = [
    {
      name: 'firstName',
      label: t('public.register.form.name.first'),
    },
    {
      name: 'lastName',
      label: t('public.register.form.name.last'),
    },
    {
      name: 'email',
      label: t('public.register.form.email'),
    },
    // {
    //   name: 'numberOfPeople',
    //   label: 'Number of people',
    // },
  ];

  return (
    <Box mb="8">
      <form onSubmit={handleSubmit((data) => onSubmit(data))}>
        <Stack spacing={2}>
          {fields.map((field) => (
            <FormField key={field.name} label={field.label}>
              <Input {...register(field.name, { required: true })} size="sm" />
            </FormField>
          ))}
          <FormField label={t('public.register.form.people.number')}>
            <NumberInput size="sm">
              <NumberInputField {...register('numberOfPeople', { required: true })} />
            </NumberInput>
          </FormField>
          <Box pt="2" w="100%">
            <Button
              colorScheme="green"
              isDisabled={isUpdateMode && !isDirty}
              isLoading={isSubmitting}
              loadingText={t('public.register.form.loading')}
              size="sm"
              type="submit"
              w="100%"
            >
              {isUpdateMode
                ? t('public.register.form.actions.update')
                : t('public.register.form.actions.create')}
            </Button>
          </Box>
          {isUpdateMode && (
            <Button
              colorScheme="red"
              isLoading={deleteLoading}
              size="sm"
              variant="ghost"
              onClick={() => {
                setDeleteLoading(true);
                onDelete();
              }}
            >
              {t('public.register.form.actions.remove')}
            </Button>
          )}
        </Stack>
      </form>
    </Box>
  );
}
