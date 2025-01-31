import React from 'react';
import { Box, Flex, List, ListItem, Menu, MenuItem, MenuButton, MenuList } from '@chakra-ui/react';
import EllipsisVertical from 'lucide-react/dist/esm/icons/ellipsis-vertical';

function ListItemWithActions({ listItem, actionsDisabled, renderChildren }) {
  return (
    <Flex justify="space-between">
      <Box w="100%">{renderChildren(listItem)}</Box>
      <Box>
        {!actionsDisabled && (
          <Menu placement="bottom-end">
            <MenuButton type="button">
              <EllipsisVertical boxSize="6" />
            </MenuButton>
            <MenuList>
              {listItem?.actions &&
                listItem?.actions.map((action) => (
                  <MenuItem
                    key={action.content}
                    isDisabled={action.isDisabled}
                    onClick={action.isDisabled ? null : action.handleClick}
                  >
                    {action.content}
                  </MenuItem>
                ))}
            </MenuList>
          </Menu>
        )}
      </Box>
    </Flex>
  );
}

export default function NiceList({
  actionsDisabled = true,
  itemBg,
  keySelector = '_id',
  list,
  children,
  spacing = '4',
  ...otherProps
}) {
  return (
    <List spacing={spacing} {...otherProps} p="0">
      {list.map((listItem) => (
        <ListItem key={listItem[keySelector]} bg={itemBg} mb="2">
          {' '}
          <ListItemWithActions
            listItem={listItem}
            actionsDisabled={actionsDisabled}
            renderChildren={children}
          />
        </ListItem>
      ))}
    </List>
  );
}
