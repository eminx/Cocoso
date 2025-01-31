import React from 'react';
import { useTranslation } from 'react-i18next';

import Calendar from './Calendar';

export default function CalendarContainer(props) {
  const [tc] = useTranslation('common');

  const allProps = {
    ...props,
    tc,
  };

  return <Calendar {...allProps} />;
}
