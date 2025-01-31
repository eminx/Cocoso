import React from 'react';
import { Center, IconButton, Menu, MenuButton, MenuList, MenuItem, Text } from '@chakra-ui/react';
import Settings from 'lucide-react/dist/esm/icons/settings';
import { useTranslation } from 'react-i18next';

export default function AdminFunctions({ menuItems, onSelect }) {
  const [t] = useTranslation('admin');

  return (
    <>
      <Center>
        <Menu closeOnSelect>
          <MenuButton size="sm">
            <IconButton
              _hover={{ bg: 'brand.200' }}
              _active={{ bg: 'brand.200' }}
              as="span"
              bg="brand.100"
              border="1px solid #fff"
              borderRadius="50%"
              icon={<Settings />}
              variant="ghost"
            />
            <Text color="brand.50" fontSize="xs">
              {t('label')}
            </Text>
          </MenuButton>
          <MenuList size="lg">
            {menuItems.map((item) => (
              <MenuItem key={item.kind} onClick={() => onSelect(item)}>
                {item.label}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
      </Center>
    </>
  );
}
