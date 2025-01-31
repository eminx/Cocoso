import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription, Box, Button, Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import parseHtml from 'html-react-parser';

import { StateContext } from '../LayoutContainer';

function NewEntryHelper({
  buttonLabel,
  buttonLink,
  children,
  isEmptyListing = false,
  small = false,
  title,
}) {
  const { currentHost } = useContext(StateContext);
  const location = useLocation();
  const [tc] = useTranslation('common');

  const activeMenuItem = currentHost?.settings?.menu?.find((item) =>
    location?.pathname?.split('/').includes(item.name)
  );

  const titleGeneric = isEmptyListing
    ? parseHtml(tc('message.newentryhelper.emptylisting.title'))
    : parseHtml(tc('message.newentryhelper.title', { listing: activeMenuItem?.label }));

  const descriptionGeneric = isEmptyListing
    ? tc('message.newentryhelper.emptylisting.description')
    : tc('message.newentryhelper.description');

  const buttonLabelGeneric = tc('message.newentryhelper.button');

  const w = '100%';
  const h = small ? '240px' : '315px';

  return (
    <Link className="sexy-thumb-container" to={buttonLink}>
      <Box
        _hover={{ bg: 'brand.100' }}
        _active={{ bg: 'brand.200' }}
        bg="brand.50"
        border="1px solid"
        borderColor="brand.500"
        fontWeight="bold"
        h={h}
        px="4"
        py="8"
        w={w}
      >
        <h3 className="thumb-title" style={{ color: 'var(--chakra-colors-brand-500)' }}>
          {titleGeneric}
        </h3>
        <h4 className="thumb-subtitle" style={{ color: 'var(--chakra-colors-brand-500)' }}>
          {descriptionGeneric}
        </h4>
      </Box>
    </Link>
  );
}
export default NewEntryHelper;
