import React, { useContext } from 'react';
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Input,
  Menu,
  MenuButton,
  MenuList,
  Select,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { Search2Icon } from '@chakra-ui/icons/dist/Search2';

import { StateContext } from '../LayoutContainer';

function FiltrerSorter(props) {
  const { isDesktop } = useContext(StateContext);
  const [tc] = useTranslation('common');

  return (
    <Box position="relative" mt="6" w="100px" zIndex="2">
      <Menu>
        <MenuButton
          as={Button}
          leftIcon={<Search2Icon />}
          mt="3.5"
          size="xs"
          style={{ position: 'absolute', bottom: '4px' }}
          variant="link"
        >
          {tc('labels.filterAndSort')}
        </MenuButton>
        <MenuList bg="gray.200" p="4" border="1px solid #aaa">
          <Inputs {...props} isDesktop={isDesktop} tc={tc} />
        </MenuList>
      </Menu>
    </Box>
  );
}

function Inputs({
  filterWord,
  setFilterWord,
  sorterValue,
  setSorterValue,
  tc,
  isDesktop,
  children,
}) {
  return (
    <Flex
      align="flex-start"
      direction="column"
      justify="flex-start"
      wrap={isDesktop ? 'nowrap' : 'wrap'}
    >
      <Heading fontSize="sm">{tc('labels.filter')}:</Heading>
      <Input
        my="2"
        placeholder={tc('domains.props.title') + '...'}
        size="sm"
        value={filterWord}
        onChange={(event) => setFilterWord(event.target.value)}
      />
      <Box>{children}</Box>
      <Divider />
      <Heading fontSize="sm" mt="4">
        {tc('labels.sort')}:
      </Heading>
      <Select
        my="2"
        name="sorter"
        size="sm"
        value={sorterValue}
        onChange={(e) => setSorterValue(e.target.value)}
      >
        <option value="date">{tc('labels.sortBy.date')}</option>
        <option value="name">{tc('labels.sortBy.name')}</option>
      </Select>
    </Flex>
  );
}

export default FiltrerSorter;
