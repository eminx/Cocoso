import React from 'react';
import { useForm } from 'react-hook-form';
import { Box, Button, Flex, Input, Textarea, VStack } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { hostFields } from '../utils/constants/general';
import FormField from './FormField';

function NewHostForm({ defaultValues, onSubmit }) {
  const { formState, handleSubmit, register } = useForm({
    defaultValues,
  });
  const { isDirty, isSubmitting } = formState;

  const [t] = useTranslation('hosts');
  const [tc] = useTranslation('common');

  return (
    <Box minW="300px">
      <form onSubmit={handleSubmit((data) => onSubmit(data))}>
        <VStack spacing="6">
          {hostFields.map((props) => (
            <FormField key={props.name} label={t(`new.${props.name}.label`)}>
              {props.textArea ? (
                <Textarea
                  {...props}
                  {...register(props.name)}
                  placeholder={t(`new.${props.name}.holder`)}
                />
              ) : (
                <Input
                  {...props}
                  {...register(props.name)}
                  placeholder={t(`new.${props.name}.holder`)}
                />
              )}
            </FormField>
          ))}

          <Flex justify="flex-end" py="4" w="100%">
            <Button isDisabled={!isDirty} isLoading={isSubmitting} type="submit">
              {tc('actions.submit')}
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  );
}

export default NewHostForm;
