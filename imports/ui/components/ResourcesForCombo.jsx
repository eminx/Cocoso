import React from 'react';
import { Flex, Tag, Text } from '@chakra-ui/react';

function ResourcesForCombo({ resource }) {
  if (!resource) {
    return null;
  }
  const resourcesForCombo = resource.resourcesForCombo;
  const length = resource.resourcesForCombo.length;
  return (
    <span>
      <Flex mb="2">
        <Text mr="2">{resource.label}</Text>
        <Tag size="sm">COMBO</Tag>
      </Flex>
      {' ['}
      {resourcesForCombo.map((res, i) => (
        <Text as="span" fontSize="sm" key={res._id}>
          {res.label + (i < length - 1 ? ' + ' : '')}
        </Text>
      ))}
      ]
    </span>
  );
}

export default ResourcesForCombo;