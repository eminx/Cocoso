import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Switch,
  Text,
  VStack,
  Wrap,
  IconButton,
  WrapItem,
} from '@chakra-ui/react';
import SmallCloseIcon from 'lucide-react/dist/esm/icons/x-circle';
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import AutoCompleteSelect from 'react-select';
import makeAnimated from 'react-select/animated';

import { call, resizeImage, uploadImage } from '../../../utils/shared';
import { message } from '../../../generic/message';
import FormField from '../../../forms/FormField';
import FileDropper from '../../../forms/FileDropper';
import NiceSlider from '../../../generic/NiceSlider';
import Loader from '../../../generic/Loader';
import ReactQuill from '../../../forms/Quill';
import DocumentsField from './DocumentsField';

const animatedComponents = makeAnimated();

function ResourceForm({ defaultValues, isEditMode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [resources, setResources] = useState([]);
  const [resourcesForCombo, setResourcesForCombo] = useState([]);
  const defaultImages = defaultValues?.images ? defaultValues.images : [];
  const [images, setImages] = useState(defaultImages);

  const { formState, handleSubmit, getValues, register, control } = useForm({
    defaultValues,
  });
  const { isDirty, isSubmitting } = formState;
  const isCombo = getValues('isCombo');

  const [t] = useTranslation('resources');
  const [tc] = useTranslation('common');
  const navigate = useNavigate();

  useEffect(() => {
    getResources();
    setResourcesForCombo(defaultValues && defaultValues.isCombo && defaultValues.resourcesForCombo);
  }, []);

  const getResources = async () => {
    try {
      const response = await call('getResources');
      setResources(response);
      setIsLoading(false);
    } catch (error) {
      message.error(error.reason);
    }
  };

  const handleUploadImage = async () => {
    try {
      const imagesReadyToSave = await Promise.all(
        images.map(async (image) => {
          if (image.type === 'not-uploaded') {
            const resizedImage = await resizeImage(image.resizableData, 1200);
            const uploadedImageUrl = await uploadImage(resizedImage, 'resourceImageUpload');
            return uploadedImageUrl;
          }
          return image;
        })
      );
      return imagesReadyToSave;
    } catch (error) {
      console.error('Error uploading:', error);
      message.error(error.reason);
    }
  };

  const onSubmit = async (formValues) => {
    const { isCombo } = formValues;
    if (isCombo && (!resourcesForCombo || resourcesForCombo.length < 2)) {
      message.error(t('messages.comborequires'));
      return;
    }

    const values = {
      ...formValues,
      resourcesForCombo: resourcesForCombo || [],
    };

    if (images?.length > 0) {
      values.images = await handleUploadImage();
    }

    try {
      if (isEditMode) {
        await call('updateResource', defaultValues._id, values);
        message.success(tc('message.success.update'));
        navigate(`/resources/${defaultValues._id}/info`);
      } else {
        const newResource = await call('createResource', values);
        message.success(tc('message.success.create'));
        if (newResource) {
          navigate(`/resources/${newResource}/info`);
        }
      }
    } catch (error) {
      console.log(error);
      message.error(error.reason || error.error);
    }
  };

  const handleAutoCompleteSelectChange = (newValue, actionMeta) => {
    setResourcesForCombo(newValue);
  };

  const handleRemoveImage = (imageIndex) => {
    setImages(images.filter((image, index) => imageIndex !== index));
  };

  const handleSortImages = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;
    setImages(arrayMove(images, oldIndex, newIndex));
  };

  const setFileDropperImage = (files) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener(
        'load',
        () => {
          setImages((images) => [
            ...images,
            {
              resizableData: file,
              type: 'not-uploaded',
              src: reader.result,
            },
          ]);
        },
        false
      );
    });
  };

  if (!defaultValues) {
    return null;
  }

  const autoCompleteOptions = resources
    .filter((r) => !r.isCombo)
    .map((r) => ({
      _id: r._id,
      label: r.label,
      description: r.description,
      resourceIndex: r.resourceIndex,
    }));

  return (
    <Box>
      <form onSubmit={handleSubmit((data) => onSubmit(data))}>
        <VStack spacing="6">
          <FormControl>
            <Flex alignItems="center">
              <Switch {...register('isBookable')} id="is-bookable-switch" />
              <FormLabel htmlFor="is-bookable-switch" my="0" ml="4">
                {t('form.bookable.switch.label')}
              </FormLabel>
            </Flex>
            <FormHelperText color="#585858">{t('form.bookable.switch.helper')}</FormHelperText>
          </FormControl>

          <FormControl>
            <Flex alignItems="center">
              <Switch {...register('isCombo')} isDisabled={isEditMode} id="is-combo-switch" />
              <FormLabel htmlFor="is-combo-switch" my="0" ml="4">
                {t('form.combo.switch.label')}
              </FormLabel>
            </Flex>
            <FormHelperText color="#585858">{t('form.combo.switch.helper')}</FormHelperText>
          </FormControl>

          {isCombo && (
            <Box bg="gray.100" p="6" w="90%">
              <Text fontSize="sm" mb="6">
                {t('form.combo.select.helper')}
              </Text>
              {isLoading ? (
                <Loader />
              ) : (
                <AutoCompleteSelect
                  isMulti
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  defaultValue={resourcesForCombo}
                  options={autoCompleteOptions}
                  style={{ width: '100%', marginTop: '1rem' }}
                  getOptionValue={(option) => option._id}
                  onChange={handleAutoCompleteSelectChange}
                />
              )}
            </Box>
          )}

          <FormField helperText={t('form.name.helper')} label={t('form.name.label')} isRequired>
            <Input
              {...register('label', { isRequired: true })}
              placeholder={t('form.name.holder')}
            />
          </FormField>

          <FormField helperText={t('form.description.helper')} label={t('form.description.label')}>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <ReactQuill {...field} placeholder={t('form.description.holder')} />
              )}
            />
          </FormField>

          <FormField
            helperText={t('form.images.helper')}
            label={t('form.images.label', { count: images.length })}
          >
            <Box>
              {images && (
                <>
                  <Center>
                    <NiceSlider
                      width="300px"
                      images={images.map((image) => (image.src ? image.src : image))}
                    />
                  </Center>
                  <Center>
                    <SortableContainer
                      onSortEnd={handleSortImages}
                      axis="xy"
                      helperClass="sortableHelper"
                    >
                      {images.map((image, index) => (
                        <SortableItem
                          key={`sortable_img_${index}`}
                          index={index}
                          image={image.src ? image.src : image}
                          onRemoveImage={() => handleRemoveImage(index)}
                        />
                      ))}
                    </SortableContainer>
                  </Center>
                </>
              )}
              <Center w="100%">
                <FileDropper setUploadableImage={setFileDropperImage} isMultiple />
              </Center>
            </Box>
          </FormField>

          <FormField
            helperText={isEditMode && tc('documents.helper')}
            label={tc('documents.label')}
          >
            {!isEditMode ? (
              tc('documents.newNotice')
            ) : (
              <DocumentsField contextType="resources" contextId={defaultValues?._id} isAllowed />
            )}
          </FormField>

          <Flex justify="flex-end" py="4" w="100%">
            <Button isLoading={isSubmitting} type="submit">
              {tc('actions.submit')}
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  );
}

const thumbStyle = (backgroundImage) => ({
  backgroundImage: backgroundImage && `url('${backgroundImage}')`,
});

const SortableItem = sortableElement(({ image, onRemoveImage, index }) => (
  <WrapItem key={image} className="sortable-thumb" style={thumbStyle(image)}>
    <IconButton
      className="sortable-thumb-icon"
      colorScheme="gray.900"
      icon={<SmallCloseIcon style={{ pointerEvents: 'none' }} />}
      size="xs"
      onClick={onRemoveImage}
      style={{ position: 'absolute', top: 4, right: 4 }}
    />
  </WrapItem>
));

const SortableContainer = sortableContainer(({ children }) => <Wrap py="2">{children}</Wrap>);

export default ResourceForm;
