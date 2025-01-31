import React from 'react';
import {
  Box,
  Code,
  FormControl,
  FormLabel,
  IconButton,
  NumberInput,
  NumberInputField,
  Switch,
  Text,
  Wrap,
} from '@chakra-ui/react';
import DeleteIcon from 'lucide-react/dist/esm/icons/x';
import { useTranslation } from 'react-i18next';

import DateTimePicker from './DateTimePicker';

const maxAttendees = 1000;

function ConflictMarker({ occurrence, t }) {
  return (
    <Box>
      <Text fontSize="sm" textAlign="center" fontWeight="bold">
        {t('form.conflict.alert')}
        <br />
      </Text>
      <Code
        colorScheme={occurrence.isConflictOK ? 'orange' : 'red'}
        mx="auto"
        display="block"
        width="fit-content"
        mt="4"
      >
        {occurrence.conflict.startDate === occurrence.conflict.endDate
          ? occurrence.conflict.startDate
          : `${occurrence.conflict.startDate}-${occurrence.conflict.endDate}`}
        {', '}
        {`${occurrence.conflict.startTime} – ${occurrence.conflict.endTime}`}
      </Code>
      {occurrence.isConflictOK && (
        <Text fontSize="sm" fontWeight="bold" mt="2" textAlign="center">
          {t('form.conflict.notExclusiveInfo')}
        </Text>
      )}
    </Box>
  );
}

function DatesAndTimes({
  occurrence,
  id,
  handleDateTimeChange,
  handleCapacityChange,
  handleRangeSwitch,
  removeOccurrence,
  isDeletable,
  isPublicActivity,
}) {
  if (!occurrence) {
    return null;
  }

  const [t] = useTranslation('activities');

  const isRange = occurrence.isRange;

  const getBorderColor = () => {
    if (!occurrence.conflict) {
      return 'gray.400';
    } else if (occurrence.isConflictOK) {
      return 'orange';
    }
    return 'red';
  };

  return (
    <Box
      bg="white"
      borderColor={getBorderColor()}
      borderRadius="8px"
      borderWidth="1px"
      mb="4"
      p="4"
      position="relative"
    >
      {isDeletable && (
        <IconButton
          bg="gray.700"
          icon={<DeleteIcon />}
          position="absolute"
          right="12px"
          top="12px"
          size="sm"
          zIndex={9}
          onClick={removeOccurrence}
        />
      )}

      <Box mb="2">
        <FormControl w="auto" alignItems="center" display="flex">
          <Switch isChecked={isRange} id={id} onChange={handleRangeSwitch} py="2" />
          <FormLabel htmlFor={id} mb="1" ml="2">
            {t('form.days.multiple')}
          </FormLabel>
        </FormControl>
      </Box>

      <Wrap>
        <Box>
          <DateTimePicker isRange={isRange} value={occurrence} onChange={handleDateTimeChange} />
        </Box>

        <Box flexDirection="column" mb="6" justify="space-around" flexGrow={0} flexBasis="180px">
          {isPublicActivity && (
            <Box mt="4">
              <Text mb="2">{t('form.capacity.label')}:</Text>
              <NumberInput
                min={1}
                max={maxAttendees}
                value={occurrence.capacity}
                variant="filled"
                onChange={handleCapacityChange}
              >
                <NumberInputField placeholder="Capacity" />
              </NumberInput>
            </Box>
          )}
        </Box>
      </Wrap>

      {occurrence.conflict && <ConflictMarker occurrence={occurrence} t={t} />}
    </Box>
  );
}

export { ConflictMarker };

export default DatesAndTimes;
