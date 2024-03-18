import React, { useContext } from 'react';
import { Box, Flex, Heading } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { StateContext } from '../LayoutContainer';
import BackLink from './BackLink';
import renderHTML from 'react-render-html';

export default function FormTitle({ context, isCalendar, isNew = false }) {
  const { currentHost, isDesktop } = useContext(StateContext);
  const [tc] = useTranslation('common');

  const menu = currentHost?.settings?.menu;
  let currentContext = menu?.find((item) => {
    if (isCalendar) {
      return item.name === 'calendar';
    }
    if (context === 'pages') {
      return item.name === 'info';
    }
    return item.name === context;
  });

  return (
    <Box>
      <Flex px="2" mb="2">
        <BackLink
          backLink={{ label: currentContext?.label, value: '/' + context }}
          isSmall={false}
        />
      </Flex>
      <Heading mb="4" size="lg" textAlign="center">
        {isNew
          ? renderHTML(tc('labels.newFormEntry', { context: currentContext?.label }))
          : renderHTML(tc('labels.editFormEntry', { context: currentContext?.label }))}
      </Heading>
    </Box>
  );
}
