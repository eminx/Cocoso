import React, { useContext } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Box, Center, Heading, Image, Link as CLink, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

import { StateContext } from '../../LayoutContainer';
import { Signup } from './index';
import { createAccount } from './functions';
// import NewPlatform from '';

function SignupPage() {
  const [t] = useTranslation('accounts');
  const { currentUser, platform } = useContext(StateContext);

  if (currentUser && platform?.isFederationLayout) {
    return <Navigate to="/intro" />;
  } else if (currentUser) {
    return <Navigate to={`/@${currentUser.username}`} />;
  }

  return (
    <Box pb="8">
      <Center>
        <Box w="sm">
          {platform && (
            <Center>
              <Box>
                <Center p="4">
                  <Image w="240px" src={platform?.logo} />
                </Center>
                <Heading mb="4" size="md" textAlign="center">
                  {t('signup.labels.title')}
                </Heading>
                {platform?.isFederationLayout && (
                  <Text textAlign="center">
                    {t('signup.labels.platform', { platform: platform?.name })}
                  </Text>
                )}
              </Box>
            </Center>
          )}

          <Center pb="4">
            <Text>
              {t('signup.labels.subtitle')}{' '}
              <Link to="/login">
                <CLink as="span" color="blue.500">
                  <b>{t('actions.login')}</b>
                </CLink>
              </Link>
            </Text>
          </Center>

          <Box bg="gray.100" borderColor="gray.300" borderWidth={1} mb="4" p="6">
            <Signup onSubmit={(values) => createAccount(values)} />
          </Box>
        </Box>
      </Center>
    </Box>
  );
}

export default SignupPage;
