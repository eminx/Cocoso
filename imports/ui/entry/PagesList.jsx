import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Center, Heading, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import ChevronDownIcon from 'lucide-react/dist/esm/icons/chevron-down';

import { parseTitle } from '../utils/shared';

function PagesList({ currentPage, pages }) {
  const navigate = useNavigate();

  if (pages?.length === 1) {
    return (
      <Center zIndex="1400">
        <Heading color="gray.800" size="md">
          {currentPage?.title}
        </Heading>
      </Center>
    );
  }

  return (
    <Center zIndex="1400" my="6">
      <Menu placement="bottom">
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          fontSize="1.8rem"
          variant="ghost"
          whiteSpace="normal"
        >
          {currentPage?.title}
        </MenuButton>
        <MenuList zIndex={2}>
          {pages.map((p) => (
            <MenuItem
              key={p.title + p.creationDate}
              isDisabled={currentPage?.title === parseTitle(p.title)}
              maxW="320px"
              whiteSpace="normal"
              onClick={() => navigate(`/pages/${parseTitle(p.title)}`)}
            >
              {p.title}
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Center>
  );
}

export default PagesList;
