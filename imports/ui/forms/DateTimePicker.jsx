import React from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import AntTimePicker from 'antd/lib/time-picker';
import AntDatePicker from 'antd/lib/date-picker';
import ConfigProvider from 'antd/lib/config-provider';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import en from 'antd/locale/en_US';
import sv from 'antd/locale/sv_SE';
import tr from 'antd/locale/tr_TR';

dayjs.extend(customParseFormat);

const antTheme = {
  components: {
    DatePicker: {
      zIndexPopup: 1500,
    },
    TimePicker: {
      zIndexPopup: 1500,
    },
  },
};

function DatePicker({ disabledDate, label, value, onChange }) {
  return (
    <Box mb="4">
      <Text mb="2">{label}</Text>
      <AntDatePicker
        disabledDate={disabledDate ? (date) => date && date < dayjs(disabledDate) : null}
        size="large"
        value={dayjs(value, 'YYYY-MM-DD')}
        style={{ zIndex: 1500 }}
        onChange={onChange}
      />
    </Box>
  );
}

function TimePicker({ label, value, onChange }) {
  return (
    <Box>
      <Text mb="2">{label}</Text>
      <AntTimePicker
        format="HH:mm"
        minuteStep={5}
        size="large"
        value={dayjs(value, 'HH:mm')}
        style={{ zIndex: 1500 }}
        onChange={onChange}
      />
    </Box>
  );
}

export default function DateTimePicker({ isRange = false, value, onChange }) {
  const [t] = useTranslation('activities');
  const { i18n } = useTranslation();
  let locale = en;
  if (i18n.language === 'sv') {
    locale = sv;
  } else if (i18n.language === 'sv') {
    locale = tr;
  }

  const handleDateChange = (date, entity) => {
    if (!date) {
      return;
    }

    const parsedValue = {
      ...value,
    };

    if (isRange) {
      if (entity === 'endDate') {
        parsedValue.endDate = date.format('YYYY-MM-DD');
      } else {
        parsedValue.startDate = date.format('YYYY-MM-DD');
        if (dayjs(parsedValue.startDate).isAfter(dayjs(parsedValue.endDate))) {
          parsedValue.endDate = date.format('YYYY-MM-DD');
        }
      }
    } else {
      parsedValue.startDate = date.format('YYYY-MM-DD');
      parsedValue.endDate = date.format('YYYY-MM-DD');
    }

    onChange(parsedValue);
  };

  const handleTimeChange = (time, entity) => {
    if (!time) {
      return;
    }

    const parsedValue = {
      ...value,
    };

    parsedValue[entity] = time.format('HH:mm');
    if (!isRange && dayjs(parsedValue.startTime).isAfter(dayjs(parsedValue.endTime))) {
      parsedValue.endTime = time.format('HH:mm');
    }

    onChange(parsedValue);
  };

  return (
    <Box w="100%" py="2">
      <ConfigProvider locale={locale} theme={antTheme}>
        <Flex>
          <Box w="170px" mr="2">
            <DatePicker
              label={isRange ? t('form.date.start') : t('form.days.single')}
              value={value.startDate}
              onChange={(date) => handleDateChange(date, 'startDate')}
            />
          </Box>

          {isRange && (
            <DatePicker
              disabledDate={value.startDate}
              label={t('form.date.finish')}
              value={value.endDate}
              onChange={(date) => handleDateChange(date, 'endDate')}
            />
          )}
        </Flex>

        <Flex>
          <Box w="170px">
            <TimePicker
              label={t('form.time.start')}
              value={value?.startTime || '08:00'}
              onChange={(time) => handleTimeChange(time, 'startTime')}
            />
          </Box>

          <TimePicker
            label={t('form.time.finish')}
            value={value?.endTime || '16:00'}
            onChange={(time) => handleTimeChange(time, 'endTime')}
          />
        </Flex>
      </ConfigProvider>
    </Box>
  );
}
