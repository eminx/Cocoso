import React, { useEffect, useState } from 'react';
import RDC, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Input } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

// import locale from node_modules
import { tr, sv } from 'date-fns/locale';

// ! VALUE GIVEN MUST BE AN OBJECT LIKE THIS:
// {
//   date: '2020-01-01',
//   time: '18:00'
// }

function DatePicker({
  value,
  onChange,
  onlyTime = false,
  noTime = true,
  placeholder,
  ...otherProps
}) {
  const [selectedDate, setSelectedDate] = useState();
  const [t, i18n] = useTranslation('calendar');

  const locale = i18n.language;

  useEffect(() => {
    if (value) {
      setSelectedDate(unFormatDate(value));
    }
    registerLocaleNow();
  }, [i18n.language]);

  const registerLocaleNow = () => {
    if (!i18n) {
      return;
    } else if (i18n?.language === 'sv') {
      registerLocale('sv', sv);
    } else if (i18n?.language === 'tr') {
      registerLocale('tr', tr);
    } else {
      registerLocale('en', en);
    }
  };

  const handleChange = (date) => {
    setSelectedDate(date);
    if (onlyTime) {
      onChange(formatTime(date));
    } else if (noTime) {
      onChange(formatDate(date));
    } else {
      onChange({
        date: formatDate(date),
        time: formatTime(date),
      });
    }
  };

  return (
    <RDC
      calendarStartDay={1}
      customInput={<Input />}
      dateFormat={
        onlyTime
          ? t('datePicker.formats.time')
          : noTime
          ? t('datePicker.formats.date')
          : t('datePicker.formats.datetime')
      }
      placeholderText={
        placeholder ||
        (onlyTime
          ? t('datePicker.labels.select', { opt: t('datePicker.labels.time') })
          : noTime
          ? t('datePicker.labels.select', { opt: t('datePicker.labels.date') })
          : t('datePicker.labels.select', {
              opt: t('datePicker.labels.datetime'),
            }))
      }
      selected={selectedDate}
      showTimeSelect={onlyTime || !noTime}
      showTimeSelectOnly={onlyTime}
      locale={locale}
      timeFormat="HH:mm"
      timeIntervals={15}
      onChange={handleChange}
      {...otherProps}
    />
  );
}

function appendLeadingZeroes(n) {
  if (n <= 9) {
    return `0${n}`;
  }
  return n;
}

function unFormatDate({ date, time }) {
  if (!date || !time) {
    return new Date();
  }
  return new Date(`${date}T${time}`);
}

function formatDate(date) {
  return `${date.getFullYear()}-${appendLeadingZeroes(date.getMonth() + 1)}-${appendLeadingZeroes(
    date.getDate()
  )}`;
}

function formatTime(date) {
  return `${appendLeadingZeroes(date.getHours())}:${appendLeadingZeroes(date.getMinutes())}`;
}

export default DatePicker;
