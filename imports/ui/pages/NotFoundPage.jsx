import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Link as CLink, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import Template from '../layout/Template';

const NotFoundPage = () => {
  const [t] = useTranslation('common');
  return (
    <Template>
      <Box m="4" p="2">
        <Text textAlign="center" size="large" margin="2">
          404
        </Text>
        <Text textAlign="center" fontWeight="bold">
          {t('labels.notfound.info')}
        </Text>
        <Text textAlign="center" mt="6">
          <Link to="/">
            <CLink>{t('labels.notfound.gohome')}</CLink>
          </Link>
        </Text>
      </Box>
    </Template>
  );
};

export default NotFoundPage;
