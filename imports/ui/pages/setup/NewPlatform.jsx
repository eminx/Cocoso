import { Meteor } from 'meteor/meteor';
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Flex, Input, Textarea, VStack } from '@chakra-ui/react';

import FormField from '../../forms/FormField';
import { platformFields } from '../../utils/constants/general';

export default function NewPlatform({ onSubmit }) {
  const currentUser = Meteor.user();
  const host = window.location.host;
  const email = currentUser?.emails[0]?.address;

  const defaultValues = {
    name: '',
    email,
    portalHost: host,
  };

  const { formState, handleSubmit, register } = useForm({
    defaultValues,
  });
  const { isDirty, isSubmitting } = formState;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing="6">
          <FormField key="name" label="Name">
            <Input {...register('name')} />
          </FormField>

          <FormField key="email" label="Email address">
            <Input {...register('email')} defaultValue={email} />
          </FormField>

          <FormField key="portalHost" label="Portal Host (Main url)">
            <Input {...register('portalHost')} value={host} isDisabled />
          </FormField>

          <Flex justify="flex-end" py="4" w="100%">
            <Button isLoading={isSubmitting} type="submit">
              Confirm
            </Button>
          </Flex>
        </VStack>
      </form>
    </>
  );
}
