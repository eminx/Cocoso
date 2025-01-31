import React from 'react';
import { Center, Heading, Img, Text, VStack, Wrap } from '@chakra-ui/react';
import { Helmet } from 'react-helmet';

export default function Gridder({ items }) {
  if (!items) {
    return null;
  }

  const imageUrl =
    items.find((item) => item.imageUrl)?.imageUrl ||
    items.find((item) => {
      if (item.images) {
        return item.images[0];
      }
      return null;
    })?.images[0] ||
    null;

  return (
    <>
      <Helmet>
        <meta property="og:image" content={imageUrl} />
      </Helmet>

      <Center>
        <Wrap justify="center">
          {items.map((item) => (
            <VStack key={item._id} w={360} mb="4">
              <Img
                w={360}
                h={240}
                objectFit="cover"
                src={item.imageUrl || (item.images && item.images[0]) || item.logo}
              />
              <Heading fontSize={18}>{item.title || item.label || item.settings?.name}</Heading>
              <Text>{item._id}</Text>
            </VStack>
          ))}
        </Wrap>
      </Center>
    </>
  );
}
