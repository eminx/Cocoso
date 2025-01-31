import React from 'react';
import { Button, Flex, Input, Stack } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '../../forms/FormField';
import ChangeLanguage from '../../layout/ChangeLanguageMenu';

function SettingsForm({ initialValues, onSubmit }) {
  const { handleSubmit, register, formState } = useForm({
    defaultValues: initialValues,
  });

  const { isDirty, isSubmitting } = formState;

  const [t] = useTranslation('hosts');
  const [tc] = useTranslation('common');

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))}>
      <Stack spacing="4">
        <FormField label={t('new.name.label')}>
          <Input {...register('name')} />
        </FormField>
        <FormField label={t('new.email.label')}>
          <Input type="email" {...register('email')} />
        </FormField>
        <FormField label={t('new.address.label')}>
          <Input {...register('address')} />
        </FormField>
        <FormField label={t('new.city.label')}>
          <Input {...register('city')} />
        </FormField>
        <FormField label={t('new.country.label')}>
          <Input {...register('country')} />
        </FormField>
        <FormField label={tc('langs.label')}>
          <ChangeLanguage hideHelper select register={register} />
        </FormField>
        <Flex justify="flex-end" py="4">
          <Button isDisabled={!isDirty || isSubmitting} type="submit">
            {tc('actions.submit')}
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}

export default SettingsForm;
