import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Center, Heading, IconButton, Text, VStack } from '@chakra-ui/react';
import PlusSquareIcon from 'lucide-react/dist/esm/icons/plus-square';
import parseHtml from 'html-react-parser';

import { StateContext } from '../../LayoutContainer';
import Loader from '../../generic/Loader';
import { message, Alert } from '../../generic/message';
import { call } from '../../utils/shared';
import ReactQuill from '../../forms/Quill';
import Template from '../../layout/Template';
import { AdminMenu } from './Settings';

export default function PlatformRegistrationIntro({ history }) {
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState(null);
  const [registrationIntro, setRegistrationIntro] = useState(['']);
  const [saving, setSaving] = useState(false);

  const { currentUser, getPlatform } = useContext(StateContext);

  const [tc] = useTranslation('common');

  useEffect(() => {
    getPlatformNow();
  }, []);

  const getPlatformNow = async () => {
    try {
      const respond = await call('getPlatform');
      setPlatform(respond);
      if (respond && respond.registrationIntro) {
        setRegistrationIntro(respond.registrationIntro);
      }
      getPlatform();
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddSlide = () => {
    setRegistrationIntro([...registrationIntro, '']);
  };

  const handleChangeRegistrationIntro = (value, index) => {
    const slides = registrationIntro.map((slide, i) => {
      if (i === index) {
        return value;
      } else {
        return slide;
      }
    });

    setRegistrationIntro(slides);
  };

  if (!currentUser || !currentUser.isSuperAdmin) {
    return <Alert>{tc('message.access.deny')}</Alert>;
  }

  if (loading) {
    return <Loader />;
  }

  const updatePlatformRegistrationIntro = async () => {
    if (!currentUser || !currentUser.isSuperAdmin) {
      message.error(tc('message.access.deny'));
      return;
    }

    setSaving(true);

    try {
      await call('updatePlatformRegistrationIntro', registrationIntro);
      await getPlatformNow();
      message.success(tc('message.success.update', { domain: 'Platform settings' }));
    } catch (error) {
      message.error(error.reason);
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Template heading={tc('menu.superadmin.intro')} leftContent={<AdminMenu />}>
        <Text mb="2">
          {parseHtml(tc('platform.registrationIntro.notice1', { platform: platform.name }))}
        </Text>

        <Text mb="4">
          {tc('platform.registrationIntro.notice2')}:
          <Button
            as="a"
            href={`https://${platform.portalHost}/intro`}
            ml="2"
            target="_blank"
            variant="link"
          >
            {tc('platform.registrationIntro.linkLabel')}
          </Button>
        </Text>
        <VStack spacing="4">
          {registrationIntro.map((slide, index) => (
            <Box key={index} py="2" w="100%">
              <Heading mb="2" size="sm">
                Slide {index + 1}
              </Heading>
              <ReactQuill
                value={slide}
                onChange={(value) => handleChangeRegistrationIntro(value, index)}
              />
              {registrationIntro.length > 1 && (
                <Center p="1">
                  <Button
                    variant="link"
                    colorScheme="red"
                    size="sm"
                    onClick={() =>
                      setRegistrationIntro(registrationIntro.filter((s, i) => i !== index))
                    }
                  >
                    {tc('actions.remove')}
                  </Button>
                </Center>
              )}
            </Box>
          ))}

          <Center bg="white" p="4" mb="8" w="100%">
            <IconButton icon={<PlusSquareIcon fontSize="xl" />} onClick={() => handleAddSlide()} />
          </Center>
        </VStack>

        <Center mb="8">
          <Button isLoading={saving} onClick={() => updatePlatformRegistrationIntro()}>
            {tc('actions.submit')}
          </Button>
        </Center>
      </Template>
    </Box>
  );
}
