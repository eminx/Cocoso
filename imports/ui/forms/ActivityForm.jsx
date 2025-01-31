import React, { useContext, useEffect } from 'react';
import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  IconButton,
  Input,
  Select,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import AddIcon from 'lucide-react/dist/esm/icons/plus';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import parseHtml from 'html-react-parser';

import DatesAndTimes from './DatesAndTimes';
import FormField from './FormField';
import ReactQuill from './Quill';
import { localeSort } from '../utils/shared';
import { StateContext } from '../LayoutContainer';
import NiceSlider from '../generic/NiceSlider';
import ImageUploadUI from './ImageUploadUI';
import { DocumentUploadHelper } from './UploadHelpers';

const defaultCapacity = 40;
const today = new Date().toISOString().substring(0, 10);

const emptyDateAndTime = {
  startDate: today,
  endDate: today,
  startTime: '00:00',
  endTime: '23:59',
  attendees: [],
  capacity: defaultCapacity,
};

function ActivityForm({
  datesAndTimes,
  defaultValues,
  images,
  isButtonDisabled,
  isPublicActivity,
  isSubmitting,
  resources,
  onRemoveImage,
  onSortImages,
  onSubmit,
  setDatesAndTimes,
  setUploadableImages,
  setSelectedResource,
}) {
  const { currentHost } = useContext(StateContext);
  const { control, handleSubmit, getValues, register } = useForm({
    defaultValues,
  });

  useEffect(() => {
    setSelectedResource(getValues('resourceId'));
  }, [defaultValues]);

  const [tc] = useTranslation('common');
  const [t] = useTranslation('activities');

  const addRecurrence = () => {
    const newDatesAndTimes = [...datesAndTimes, { ...emptyDateAndTime }];

    setDatesAndTimes(newDatesAndTimes);
  };

  const removeOccurrence = (index) => {
    const newDatesAndTimes = datesAndTimes.filter((item, i) => i !== index);

    setDatesAndTimes(newDatesAndTimes);
  };

  const handleDateTimeChange = (date, occurrenceIndex) => {
    const newDatesAndTimes = datesAndTimes.map((item, index) => {
      if (index === occurrenceIndex) {
        return date;
      }
      return item;
    });

    setDatesAndTimes(newDatesAndTimes);
  };

  const handleCapacityChange = (value, occurrenceIndex) => {
    const newDatesAndTimes = datesAndTimes.map((item, index) => {
      if (occurrenceIndex === index) {
        return {
          ...item,
          capacity: Number(value),
        };
      }
      return item;
    });

    setDatesAndTimes(newDatesAndTimes);
  };

  const handleRangeSwitch = (event, occurrenceIndex) => {
    const value = event.target.checked;
    const newDatesAndTimes = datesAndTimes.map((item, index) => {
      if (occurrenceIndex === index && !value) {
        return {
          ...item,
          endDate: item.startDate,
        };
      }
      return item;
    });

    setDatesAndTimes(newDatesAndTimes);
  };

  const resourcesInMenu = currentHost?.settings?.menu?.find((item) => item.name === 'resources');

  return (
    <div>
      <form onSubmit={handleSubmit((data) => onSubmit(data))}>
        <Box mb="8">
          <FormField
            helperText={t('form.resource.helper')}
            label={
              <b>
                {parseHtml(
                  t('form.resource.label', {
                    resources: resourcesInMenu?.label,
                  })
                )}
              </b>
            }
          >
            <Select
              {...register('resourceId')}
              placeholder={t('form.resource.holder')}
              onChange={(e) => setSelectedResource(e.target.value)}
            >
              {resources
                .sort(localeSort)
                .filter((r) => r.isBookable)
                .map((option) => (
                  <option
                    key={option._id}
                    selected={option._id === defaultValues.resourceId}
                    value={option._id}
                  >
                    {option.isCombo
                      ? `${option.label}: [${option.resourcesForCombo.map((res) => res.label)}]`
                      : option.label}
                  </option>
                ))}
            </Select>
          </FormField>
        </Box>

        <Box mb="8">
          <FormField
            helperText={t('form.occurrences.helper')}
            label={<b>{t('form.occurrences.label')}</b>}
            isRequired
          />

          <Box mb="4" mt="2">
            {datesAndTimes.map((occurrence, index) => {
              const id =
                occurrence.startDate +
                occurrence.endDate +
                occurrence.startTime +
                occurrence.endTime +
                index;
              return (
                <DatesAndTimes
                  key={id}
                  id={id}
                  isPublicActivity={isPublicActivity}
                  occurrence={occurrence}
                  removeOccurrence={() => removeOccurrence(index)}
                  isDeletable={datesAndTimes.length > 1}
                  handleCapacityChange={(value) => handleCapacityChange(value, index)}
                  handleDateTimeChange={(date) => handleDateTimeChange(date, index)}
                  handleRangeSwitch={(event) => handleRangeSwitch(event, index)}
                />
              );
            })}
            <Center bg="white" borderRadius="8px" p="6">
              <IconButton bg="gray.700" size="lg" onClick={addRecurrence} icon={<AddIcon />} />
            </Center>
          </Box>
        </Box>

        <Box mb="8">
          <Heading mb="4" size="md">
            {t('form.details.label')}
          </Heading>

          <VStack spacing="6">
            <FormField helperText={t('form.title.helper')} label={t('form.title.label')} isRequired>
              <Input
                {...register('title', { required: true })}
                placeholder={t('form.title.holder')}
              />
            </FormField>

            {isPublicActivity && (
              <FormField
                helperText={t('form.subtitle.helper')}
                label={t('form.subtitle.label')}
                isRequired
              >
                <Input
                  {...register('subTitle', { required: true })}
                  placeholder={t('form.subtitle.holder')}
                />
              </FormField>
            )}

            <FormField
              helperText={t('form.description.helper')}
              label={t('form.description.label')}
              isRequired={isPublicActivity}
            >
              <Controller
                control={control}
                name="longDescription"
                render={({ field }) => <ReactQuill {...field} />}
              />
            </FormField>

            {isPublicActivity && (
              <FormField helperText={t('form.place.helper')} label={t('form.place.label')}>
                <Input {...register('place')} placeholder={t('form.place.holder')} />
              </FormField>
            )}

            {isPublicActivity && (
              <FormField helperText={t('form.address.helper')} label={t('form.address.label')}>
                <Textarea {...register('address')} placeholder={t('form.address.holder')} />
              </FormField>
            )}

            {isPublicActivity && (
              <FormField
                label={t('form.image.label', { count: images?.length || 0 })}
                helperText={t('form.image.helper')}
                isRequired
              >
                {images && (
                  <Center mb="4">
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
            )}
          </VStack>
        </Box>

        <Flex justify="flex-end" py="4" w="100%">
          <Button isDisabled={isButtonDisabled} isLoading={isSubmitting} type="submit">
            {tc('actions.submit')}
          </Button>
        </Flex>
      </form>
    </div>
  );
}

export default ActivityForm;
