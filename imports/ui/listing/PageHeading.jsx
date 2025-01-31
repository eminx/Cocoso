import React from 'react';
import { Box, Center, Heading, Divider } from '@chakra-ui/react';
import { Helmet } from 'react-helmet';

export default function PageHeading({ description, heading, children }) {
  return (
    <>
      <Helmet>
        <title>{heading}</title>
        <meta charSet="utf-8" />
        <meta name="title" content={heading} />
        <meta name="description" content={description?.substring(0, 150)} />
        <meta property="og:title" content={heading} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
      </Helmet>
      <Center>
        <Box px="2">
          <Center position="relative">
            <Heading as="h1" size="lg" textAlign="center">
              {heading}
            </Heading>
          </Center>
          <Box py="2">
            <Divider borderColor="brand.500" minW="280px" />
            <Center>{children}</Center>
            {description && (
              <Heading
                as="h2"
                fontFamily="'Sarabun', sans-serif"
                fontSize="1.17em"
                fontWeight="300"
                lineHeight="1.3"
                maxW="520px"
                my="2"
                textAlign="center"
              >
                {description}
              </Heading>
            )}
          </Box>
        </Box>
      </Center>
    </>
  );
}
