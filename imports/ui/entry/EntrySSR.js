import React from 'react';
import { Badge, Box, Center, Flex, Heading, Img } from '@chakra-ui/react';
import parseHtml from 'html-react-parser';

export default function EntrySSR({ title, subTitle, description, imageUrl }) {
  return (
    <>
      <Headings title={title} subTitle={subTitle} />

      <Center>{imageUrl && <Img src={imageUrl} h={400} />}</Center>

      <Center p={12}>
        {description && (
          <Box fontFamily="'Helvetica', sans-serif" fontWeight={400} lineHeight={1.4} w={400}>
            {parseHtml(description)}
          </Box>
        )}
      </Center>
    </>
  );
}

function Headings({ title, subTitle, tags }) {
  return (
    <Center px="2" mb="6">
      <Box>
        <Heading
          as="h1"
          lineHeight={1}
          my="2"
          size="lg"
          textAlign="center"
          textShadow="1px 1px 1px #fff"
        >
          {title}
        </Heading>
        {subTitle && (
          <Heading as="h2" size="md" fontWeight="400" lineHeight={1} my="2" textAlign="center">
            {subTitle}
          </Heading>
        )}
        {tags && tags.length > 0 && (
          <Flex flexGrow="0" justify="center" mt="4">
            {tags.map(
              (tag) =>
                tag && (
                  <Badge key={tag} bg="gray.50" color="gray.800" fontSize="14px">
                    {tag}
                  </Badge>
                )
            )}
          </Flex>
        )}
      </Box>
    </Center>
  );
}
