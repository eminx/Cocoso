import React from 'react';
import { Box, Center, ChakraProvider, Flex, Skeleton, Wrap } from '@chakra-ui/react';

const skeletonProps = {
  flex: { flexBasis: '320px', flexGrow: 1, h: '315px' },
  color: {
    startColor: 'red.50',
    endColor: 'red.100',
  },
};

export function ContentLoader({ items = 3 }) {
  const skeletons = [];
  for (let i = 1; i <= items; i++) {
    skeletons.push(i);
  }

  return (
    <Box>
      <Center mb="24px">
        <Skeleton {...skeletonProps.color} w="200px" h="40px" />
      </Center>
      <Center mb="48px">
        <Skeleton {...skeletonProps.color} w="300px" h="40px" />
      </Center>
      <Wrap justify="stretch" w="100%" spacing="2">
        {skeletons.map((n) => (
          <Skeleton key={n} {...skeletonProps.flex} {...skeletonProps.color} />
        ))}
      </Wrap>
    </Box>
  );
}

export function MainLoader() {
  return (
    <ChakraProvider>
      <Box w="100%" h="100vh" p="4">
        <Flex justify="space-between" mb="64px">
          <Skeleton {...skeletonProps.color} w="100%" h="60px" />
        </Flex>
        <ContentLoader />
      </Box>
    </ChakraProvider>
  );
}

export function TablyLoader() {
  return (
    <Flex direction="column">
      <Center my="24px">
        <Skeleton {...skeletonProps.color} w="140px" h="40px" />
      </Center>
      <Center mb="48px">
        <Skeleton {...skeletonProps.color} w="300px" h="40px" />
      </Center>
      <Center mb="36px">
        <Skeleton {...skeletonProps.color} w="720px" h="400px" />
      </Center>
      <Center>
        <Skeleton {...skeletonProps.color} w="540px" h="600px" />
      </Center>
    </Flex>
  );
}
