import React, { useContext } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { Box, Center, Flex, Heading, Link as CLink, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { ResetPassword } from './index';
import { StateContext } from '../../LayoutContainer';
import { call } from '../../utils/shared';
import { message } from '../../generic/message';

function ResetPasswordPage() {
  const [t] = useTranslation('accounts');
  const navigate = useNavigate();
  const { token } = useParams();
  const { currentUser } = useContext(StateContext);

  const handleResetPassword = async ({ password }) => {
    try {
      await call('resetPassword', token, password);
      message.success(t('password.message.reset'));
      navigate('/login');
    } catch (error) {
      message.error(error.reason);
    }
  };

  if (currentUser) {
    return <Navigate to={`/@${currentUser.username}/profile`} />;
  }

  return (
    <Box pb="8">
      <Center p="4">
        <Box w="xs">
          <Heading size="md" textAlign="center" mb="4">
            {t('password.labels.title')}
          </Heading>
          <Text fontSize="lg" mb="6" textAlign="center">
            {t('password.labels.subtitle.reset')}
          </Text>
          <Box bg="brand.50" mb="4" p="6">
            <ResetPassword onResetPassword={handleResetPassword} />
          </Box>
          <Flex justify="space-around" mt="4">
            <Link to="/login">
              <CLink as="span">{t('actions.login')}</CLink>
            </Link>
            <Link to="/register">
              <CLink as="span">{t('actions.signup')}</CLink>
            </Link>
          </Flex>
        </Box>
      </Center>
    </Box>
  );
}

export default ResetPasswordPage;
