import { Meteor } from 'meteor/meteor';
import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { Box, Button, Center } from '@chakra-ui/react';

import { Signup } from '../auth';
import NewPlatform from './NewPlatform';
import Stepper from '../../generic/Stepper';
import { call } from '../../utils/shared';
import { Alert, message } from '../../generic/message';
import NewHost from './NewHost';

const defaultSteps = [
  {
    title: 'User',
    description: 'Super admin user',
  },
  {
    title: 'Platform',
    description: 'Main Platform',
  },
  {
    title: 'Community',
    description: 'First Web app',
  },
];

export default function SetupHome({ children }) {
  const [steps, setSteps] = useState(defaultSteps);
  const [activeStep, setActiveStep] = useState('0');
  const [isFinished, setIsFinished] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const getPlatform = async () => {
      return await Meteor.callAsync('getPlatform');
    };
    const platform = getPlatform();

    if (Meteor.user()) {
      if (platform) {
        setActiveStep('2');
      } else {
        setActiveStep('1');
      }
    } else {
      setActiveStep('0');
    }
  }, []);

  useEffect(() => {
    switch (activeStep) {
      case '1':
        navigate('/setup/platform');
        break;
      case '2':
        navigate('/setup/host');
        break;
      default:
        navigate('/setup/user');
    }
  }, [activeStep]);

  const onCreateUser = async (data) => {
    try {
      const userId = await call('createAccount', data);
      Meteor.loginWithPassword(data.username, data.password, (error, respond) => {
        if (!error) {
          userId && call('setUserSuperAdmin', userId);
          setActiveStep('1');
        }
      });
    } catch (error) {
      console.log(error.error);
      message.error(error.error.reason);
    }
  };

  const onCreatePlatform = async (data) => {
    if (!data.name || !data.email || !data.portalHost) {
      message.error('All values required');
      return;
    }

    try {
      await call('createPlatform', data);
      setActiveStep('2');
    } catch (error) {
      console.log(error);
      message.error(error.reason);
    }
  };

  const finishSetup = () => {
    setActiveStep('3');
    setIsFinished(true);
  };

  if (isFinished) {
    const goHomeAndReload = () => {
      navigate('/');
      window.location.reload();
    };

    return (
      <Box bg="gray.100" pb="4">
        <Center p="4">
          <Box>
            <Alert type="success">You have successfully finished the installation</Alert>
            <Button my="4" onClick={() => goHomeAndReload()}>
              Go to the home page
            </Button>
          </Box>
        </Center>
      </Box>
    );
  }

  return (
    <Box bg="gray.100" pb="4">
      <Center>
        <Box w="xl">
          <Box p="4" mb="8">
            <Stepper steps={steps} activeStep={Number(activeStep)} />
          </Box>
          <Box bg="gray.50" px="6" py="4">
            <Routes>
              <Route
                exact
                path="/setup/user"
                element={<Signup hideTermsCheck onSubmit={onCreateUser} />}
              />
              <Route
                exact
                path="/setup/platform"
                element={<NewPlatform onSubmit={onCreatePlatform} />}
              />
              <Route
                exact
                path="/setup/host"
                element={<NewHost setFinished={() => finishSetup()} />}
              />
            </Routes>
          </Box>
        </Box>
      </Center>
    </Box>
  );
}
