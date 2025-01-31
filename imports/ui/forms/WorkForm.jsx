import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Center,
  Flex,
  FormLabel,
  Input,
  Textarea,
  Select,
  Switch,
  VStack,
} from '@chakra-ui/react';

import FormField from './FormField';
import NiceSlider from '../generic/NiceSlider';
import ReactQuill from './Quill';
import ImageUploadUI from './ImageUploadUI';
import DocumentsField from '../pages/resources/components/DocumentsField';
import { DocumentUploadHelper } from './UploadHelpers';

function WorkForm({
  categories,
  defaultValues,
  images,
  isSubmitting,
  isNew,
  onRemoveImage,
  onSortImages,
  onSubmit,
  setUploadableImages,
}) {
  const { control, handleSubmit, register } = useForm({
    defaultValues,
  });

  const [t] = useTranslation('members');
  const [tc] = useTranslation('common');

  return (
    <div>
      <form onSubmit={handleSubmit((data) => onSubmit(data))}>
        <VStack spacing="6">
          <FormField helperText={t('works.title.helper')} label={t('works.title.label')} isRequired>
            <Input
              {...register('title', { required: true })}
              placeholder={t('works.title.holder')}
            />
          </FormField>

          <FormField
            helperText={t('works.shortDescription.helper')}
            label={t('works.shortDescription.label')}
          >
            <Textarea
              {...register('shortDescription')}
              placeholder={t('works.shortDescription.holder')}
            />
          </FormField>

          <FormField
            helperText={t('works.category.helper')}
            label={t('works.category.label')}
            isRequired
          >
            <Select
              {...register('categoryId', { required: true })}
              placeholder={t('works.category.holder')}
            >
              {categories.map((cat) => (
                <option
                  key={cat._id}
                  selected={cat._id === defaultValues.categoryId}
                  value={cat._id}
                >
                  {cat?.label?.toUpperCase()}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            helperText={t('works.longDescription.helper')}
            label={t('works.longDescription.label')}
            isRequired
          >
            <Controller
              control={control}
              name="longDescription"
              rules={{ required: true }}
              render={({ field }) => (
                <ReactQuill {...field} placeholder={t('works.longDescription.holder')} />
              )}
            />
          </FormField>

          <FormField helperText={t('works.extra.helper')} label={t('works.extra.label')}>
            <Textarea {...register('additionalInfo')} placeholder={t('works.extra.holder')} />
          </FormField>

          <FormField helperText={t('works.contact.helper')} label={t('works.contact.label')}>
            <Controller
              control={control}
              name="contactInfo"
              render={({ field }) => (
                <ReactQuill {...field} placeholder={t('works.contact.holder')} />
              )}
            />
          </FormField>

          <FormField
            helperText={t('works.images.helper')}
            label={t('works.images.label', { count: images?.length })}
          >
            {images && (
              <Center>
                <NiceSlider width="300px" images={images} />
              </Center>
            )}
            <ImageUploadUI
              images={images}
              onRemoveImage={onRemoveImage}
              onSelectImages={setUploadableImages}
              onSortImages={onSortImages}
            />
            <DocumentUploadHelper isImage />
          </FormField>

          <FormField helperText={!isNew && tc('documents.helper')} label={tc('documents.label')}>
            {isNew ? (
              tc('documents.newNotice')
            ) : (
              <DocumentsField contextType="works" contextId={defaultValues?._id} isAllowed />
            )}
          </FormField>

          <FormField label={t('profile.labels.avatar')} helperText={tc('labels.avatar.helper')}>
            <Flex align="center">
              <Switch defaultChecked={isNew} id="avatar" mb="2" {...register('showAvatar')} />
              <FormLabel htmlFor="avatar">{tc('labels.avatar.checklabel')}</FormLabel>
            </Flex>
          </FormField>

          <Flex justify="flex-end" py="4" w="100%">
            <Button isLoading={isSubmitting} type="submit">
              {tc('actions.submit')}
            </Button>
          </Flex>
        </VStack>
      </form>
    </div>
  );
}

export default WorkForm;
