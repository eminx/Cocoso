import { Meteor } from 'meteor/meteor';
import React, { useContext } from 'react';
import { Box, Center, Container, Heading, SimpleGrid } from '@chakra-ui/react';
import { Helmet } from 'react-helmet';

import { StateContext } from '../LayoutContainer';

const publicSettings = Meteor.settings.public;

function Template({ heading, leftContent, rightContent, titleCentered = false, children }) {
  const { isDesktop } = useContext(StateContext);

  return (
    <>
      <Helmet>
        <title>{heading || publicSettings.name}</title>
      </Helmet>
      {isDesktop ? (
        <SimpleGrid columns={{ md: 1, lg: 3 }} p="3" templateColumns="30% 40% 30%">
          <Box>{leftContent}</Box>

          <Box>
            {heading && (
              <Box>
                <Heading as="h1" mb="4" size="lg" textAlign={titleCentered ? 'center' : 'start'}>
                  {heading}
                </Heading>
              </Box>
            )}
            <Box maxW="520px">{children}</Box>
          </Box>

          <Box>{rightContent}</Box>
        </SimpleGrid>
      ) : (
        <Center px="4">
          <Box>
            <Box>{leftContent}</Box>
            <Box>
              {heading && (
                <Box mb="2" mt="4">
                  <Heading as="h3" size="md" textAlign={titleCentered ? 'center' : 'start'}>
                    {heading}
                  </Heading>
                </Box>
              )}
              <Box maxW="520px">{children}</Box>
            </Box>
            <Box>{rightContent}</Box>
          </Box>
        </Center>
      )}
    </>
  );
}

export default Template;
