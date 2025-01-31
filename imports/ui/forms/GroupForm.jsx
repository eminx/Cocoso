import React, { useState } from 'react';
import {
  Button,
  Center,
  Flex,
  Input,
  NumberInput,
  NumberInputField,
  VStack,
} from '@chakra-ui/react';

import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FileDropper from './FileDropper';
import FormField from './FormField';
import ReactQuill from '../forms/Quill';
import { DocumentUploadHelper } from './UploadHelpers';

function GroupForm({
  uploadableImageLocal,
  setUploadableImage,
  defaultValues,
  onSubmit,
  imageUrl,
  isSubmitDisabled,
  isButtonLoading,
}) {
  const [imageChanged, setImageChanged] = useState(false);

  const { control, formState, handleSubmit, register } = useForm({
    defaultValues,
  });
  const { isDirty } = formState;
  const [t] = useTranslation('groups');
  const [tc] = useTranslation('common');

  const handleSetUploadableImage = (files) => {
    setUploadableImage(files);
    setImageChanged(true);
  };

  return (
    <div>
      <form onSubmit={handleSubmit((data) => onSubmit(data))}>
        <VStack spacing="6">
          <FormField helperText={t('form.title.helper')} label={t('form.title.label')} isRequired>
            <Input
              {...register('title', { required: true })}
              placeholder={t('form.title.holder')}
            />
          </FormField>

          <FormField
            helperText={t('form.subtitle.helper')}
            label={t('form.subtitle.label')}
            isRequired
          >
            <Input
              {...register('readingMaterial', { required: true })}
              placeholder={t('form.subtitle.holder')}
            />
          </FormField>

          <FormField
            helperText={t('form.description.helper')}
            label={t('form.description.label')}
            isRequired
          >
            <Controller
              control={control}
              name="description"
              rules={{ required: true }}
              render={({ field }) => <ReactQuill {...field} />}
            />
          </FormField>

          <FormField
            helperText={t('form.capacity.helper')}
            label={t('form.capacity.label')}
            isRequired
          >
            <NumberInput>
              <NumberInputField {...register('capacity', { required: true })} />
            </NumberInput>
          </FormField>

          <FormField
            helperText={
              uploadableImageLocal || imageUrl
                ? tc('plugins.fileDropper.replace')
                : t('form.image.helper')
            }
            isRequired
            label={t('form.image.label')}
          >
            <Center>
              <FileDropper
                imageUrl={imageUrl}
                setUploadableImage={handleSetUploadableImage}
                uploadableImageLocal={uploadableImageLocal}
              />
            </Center>
            <DocumentUploadHelper isImage />
          </FormField>

          <Flex justify="flex-end" py="4" w="100%">
            <Button
              isDisabled={(!isDirty && !imageChanged) || isSubmitDisabled}
              isLoading={isButtonLoading}
              type="submit"
            >
              {tc('actions.submit')}
            </Button>
          </Flex>
        </VStack>
      </form>
    </div>
  );
}

export default GroupForm;
