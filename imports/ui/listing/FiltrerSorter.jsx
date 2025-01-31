import React from 'react';
import {
  Box,
  Button,
  Collapse,
  Flex,
  Heading,
  Input,
  Select,
  Wrap,
  useDisclosure,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import ListFilter from 'lucide-react/dist/esm/icons/list-filter';
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down';
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up';

function Inputs({ filterValue, setFilterValue, sortValue, setSortValue, tc }) {
  return (
    <Wrap justify="space-around">
      <Box w="2xs" px="4">
        <Heading fontSize="sm">{tc('labels.filter')}:</Heading>
        <Input
          my="2"
          placeholder={`${tc('domains.props.title')} ...`}
          size="sm"
          value={filterValue}
          onChange={(event) => setFilterValue(event.target.value)}
        />
      </Box>

      <Box w="2xs" px="4">
        <Heading fontSize="sm">{tc('labels.sort')}:</Heading>
        <Select
          my="2"
          name="sorter"
          size="sm"
          value={sortValue}
          onChange={(e) => setSortValue(e.target.value)}
        >
          <option value="date">{tc('labels.sortBy.date')}</option>
          <option value="name">{tc('labels.sortBy.name')}</option>
          {/* <option value="random">{tc('labels.sortBy.random')}</option> */}
        </Select>
      </Box>
    </Wrap>
  );
}

export default function FiltrerSorter(props) {
  const [tc] = useTranslation('common');
  const { isOpen, onToggle } = useDisclosure();

  const handleToggle = () => {
    if (isOpen) {
      props.setFilterValue('');
    }
    onToggle();
  };

  return (
    <Box>
      <Flex justify="flex-end">
        <Button
          fontWeight="normal"
          leftIcon={<ListFilter />}
          mb="2"
          rightIcon={isOpen ? <ChevronUp size={18} /> : <ChevronDown size={15} />}
          size="xs"
          variant="ghost"
          onClick={() => handleToggle()}
        >
          {tc('labels.filterAndSort')}
        </Button>
      </Flex>

      <Box>
        <Collapse in={isOpen} animateOpacity>
          <Box
            bg="gray.50"
            borderColor="brand.200"
            borderWidth={1}
            borderRadius={8}
            mb="4"
            mx="2"
            p="4"
          >
            <Inputs {...props} tc={tc} />
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
}
