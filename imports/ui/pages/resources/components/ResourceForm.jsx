import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Center,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Switch,
  Text,
  VStack,
  Wrap,
  IconButton,
  WrapItem,
} from '@chakra-ui/react';
import { SmallCloseIcon } from '@chakra-ui/icons';
import ReactQuill from 'react-quill';
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import AutoCompleteSelect from 'react-select';
import makeAnimated from 'react-select/animated';

import { editorFormats, editorModules } from '../../../utils/constants/quillConfig';
import { call, resizeImage, uploadImage } from '../../../utils/shared';
import { message } from '../../../components/message';
import FormField from '../../../components/FormField';
import FileDropper from '../../../components/FileDropper';
import NiceSlider from '../../../components/NiceSlider';
import Loader from '../../../components/Loader';

const animatedComponents = makeAnimated();

const thumbStyle = (backgroundImage) => ({
  backgroundImage: backgroundImage && `url('${backgroundImage}')`,
});

const SortableItem = sortableElement(({ image, onRemoveImage }) => (
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

function ResourceForm({ defaultValues, isEditMode, history }) {
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

  const getResources = async () => {
    try {
      const response = await call('getResources');
      setResources(response);
      setIsLoading(false);
    } catch (error) {
      message.error(error.reason);
    }
  };

  useEffect(() => {
    getResources();
    setResourcesForCombo(defaultValues && defaultValues.isCombo && defaultValues.resourcesForCombo);
  }, []);

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
      message.error(error.reason);
    }
    return null;
  };

  const onSubmit = async (formValues) => {
    const values = {
      ...formValues,
      resourcesForCombo: resourcesForCombo || [],
    };

    if (values.images !== []) {
      values.images = await handleUploadImage();
    }

    try {
      if (isEditMode) {
        await call('updateResource', defaultValues._id, values);
        message.success(tc('message.success.update', { domain: tc('domains.resource') }));
        history.push(`/resources/${defaultValues._id}`);
      } else {
        const newResource = await call('createResource', values);
        message.success(tc('message.success.create', { domain: tc('domains.resource') }));
        if (newResource) {
          history.push(`/resources/${newResource}`);
        }
      }
    } catch (error) {
      message.error(error.reason || error.error);
    }
  };

  const handleAutoCompleteSelectChange = (newValue) => {
    setResourcesForCombo(newValue);
  };

  const handleRemoveImage = (imageIndex) => {
    setImages(images.filter((index) => imageIndex !== index));
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
          setImages((imgs) => [
            ...imgs,
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

  const isEditable = () => isDirty || images.length !== defaultImages.length;

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
          <FormControl display="flex" alignItems="center">
            <Switch {...register('isCombo')} isDisabled={isEditMode} id="is-combo-switch" />
            <FormLabel htmlFor="is-combo-switch" mb="0" ml="4">
              {t('form.combo.switch.label')}
            </FormLabel>
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

          <FormField label={t('form.name.label')}>
            <Input {...register('label')} placeholder={t('form.name.holder')} />
          </FormField>

          <FormField label={t('form.desc.label')}>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <ReactQuill
                  {...field}
                  formats={editorFormats}
                  modules={editorModules}
                  placeholder={t('form.desc.holder')}
                />
              )}
            />
          </FormField>

          <FormField label={t('form.images.label', { count: images.length })}>
            <Box>
              {images && (
                <>
                  <NiceSlider images={images.map((image) => (image.src ? image.src : image))} />
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
                </>
              )}
              <Center w="100%">
                <FileDropper setUploadableImage={setFileDropperImage} isMultiple />
              </Center>
            </Box>
          </FormField>

          <Flex justify="flex-end" py="4" w="100%">
            <Button isDisabled={!isEditable()} isLoading={isSubmitting} type="submit">
              {tc('actions.submit')}
            </Button>
          </Flex>
        </VStack>
      </form>
    </Box>
  );
}

export default ResourceForm;
