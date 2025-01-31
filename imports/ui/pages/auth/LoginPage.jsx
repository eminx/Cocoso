import { Meteor } from 'meteor/meteor';
import React, { useContext, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Box, Center, Heading, Image, Link as CLink, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { StateContext } from '../../LayoutContainer';
import ConfirmModal from '../../generic/ConfirmModal';
import { Login } from './index';
import { message } from '../../generic/message';
import { call } from '../../utils/shared';

function LoginPage() {
  const [t] = useTranslation('accounts');
  const { currentUser, currentHost, platform, role } = useContext(StateContext);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isJoinModal, setIsJoinModal] = useState(false);

  if (currentUser && ['participant', 'contributor', 'admin'].includes(role)) {
    return <Navigate to={`/@${currentUser.username}/profile`} />;
  }

  const handleSubmit = (values) => {
    if (values?.username?.length < 4 || values?.password?.length < 8) {
      return;
    }

    setIsSubmitted(true);
    Meteor.loginWithPassword(values.username, values.password, (error) => {
      if (error) {
        message.error(error.reason);
        setIsSubmitted(false);
        return;
      }
      setTimeout(() => {
        setIsJoinModal(true);
      }, 300);
    });
  };

  const cancelJoin = () => {
    Meteor.logout();
    setIsJoinModal(false);
    setIsSubmitted(false);
    message.info(t('logout.messages.success'));
  };

  const confirmJoin = async () => {
    try {
      await call('setSelfAsParticipant');
      message.success(t('profile.message.participant'));
    } catch (error) {
      console.error(error);
      message.error(error.reason);
    }
  };

  return (
    <Box pb="8">
      <Center>
        <Box w="xs">
          {platform && (
            <Center p="4">
              <Image w="240px" src={platform?.logo} />
            </Center>
          )}

          <Heading mb="4" size="md" textAlign="center">
            {t('login.labels.title')}
          </Heading>

          <Center mb="6">
            <Text>
              {t('login.labels.subtitle')}{' '}
              <Link to="/register">
                <CLink as="span" color="blue.500">
                  <b>{t('actions.signup')}</b>
                </CLink>
              </Link>
            </Text>
          </Center>

          <Box bg="gray.50" borderColor="gray.300" borderWidth={1} mb="4" p="6">
            <Login isSubmitted={isSubmitted} onSubmit={handleSubmit} />
          </Box>
          <Center>
            <Text textAlign="center">
              {t('actions.forgot')}
              <br />
              <Link to="/forgot-password">
                <CLink as="span" color="blue.500">
                  <b>{t('actions.reset')}</b>
                </CLink>
              </Link>
            </Text>
          </Center>
        </Box>
      </Center>

      <ConfirmModal
        title={t('profile.joinHost', { host: currentHost?.settings?.name })}
        visible={isJoinModal}
        onConfirm={() => confirmJoin()}
        onCancel={() => cancelJoin()}
        confirmText={t('profile.join')}
      >
        <Center>
          <Image src={currentHost?.logo} m="4" width="4xs" />
        </Center>
        <Text fontSize="lg">{t('profile.joinAsParticipantQuestion')}</Text>
      </ConfirmModal>
    </Box>
  );
}

export default LoginPage;
