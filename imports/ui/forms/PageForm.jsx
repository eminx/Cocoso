import React from 'react';
import { Button, Flex, Input, VStack } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from './FormField';
import ReactQuill from '../forms/Quill';
import ImageUploadUI from './ImageUploadUI';
import { DocumentUploadHelper } from './UploadHelpers';

const PageForm = ({
  defaultValues = { title: '', longDescription: '' },
  images,
  isButtonLoading = false,
  onRemoveImage,
  onSetUploadableImages,
  onSortImages,
  onSubmit,
}) => {
  const [t] = useTranslation('admin');
  const [tc] = useTranslation('common');

  const { control, handleSubmit, register } = useForm({
    defaultValues,
  });

  return (
    <div>
      <form onSubmit={handleSubmit((data) => onSubmit(data))}>
        <VStack spacing="6">
          <FormField
            helperText={t('pages.form.title.helper')}
            isRequired
            label={t('pages.form.title.label')}
          >
            <Input
              {...register('title', { required: true })}
              placeholder={t('pages.form.title.holder')}
            />
          </FormField>

          <FormField
            helperText={t('pages.form.images.helper')}
            label={t('pages.form.images.label', { count: images.length })}
          >
            <ImageUploadUI
              images={images}
              onRemoveImage={onRemoveImage}
              onSelectImages={onSetUploadableImages}
              onSortImages={onSortImages}
            />

            <DocumentUploadHelper isImage />
          </FormField>

          <FormField
            helperText={t('pages.form.description.helper')}
            isRequired
            label={t('pages.form.description.label')}
          >
            <Controller
              control={control}
              name="longDescription"
              rules={{ required: true }}
              render={({ field }) => (
                <ReactQuill {...field} placeholder={t('pages.form.description.holder')} />
              )}
            />
          </FormField>

          <Flex justify="flex-end" py="4" w="100%">
            <Button isLoading={isButtonLoading} type="submit">
              {tc('actions.submit')}
            </Button>
          </Flex>
        </VStack>
      </form>
    </div>
  );
};

export default PageForm;
