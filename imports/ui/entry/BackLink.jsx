import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@chakra-ui/react';
import ChevronLeftIcon from 'lucide-react/dist/esm/icons/chevron-left';

export default function BackLink({ backLink }) {
  if (!backLink) {
    return null;
  }

  const link = backLink.value === '/info' ? '/pages' : backLink.value;

  return (
    <Link to={link}>
      <Button as="span" leftIcon={<ChevronLeftIcon size={18} />} variant="link">
        {backLink?.label}
      </Button>
    </Link>
  );
}
