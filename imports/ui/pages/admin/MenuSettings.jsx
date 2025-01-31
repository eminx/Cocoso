import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Switch,
  Text,
  Table,
  Tbody,
  Textarea,
  Tr,
  Td,
  Code,
} from '@chakra-ui/react';

import DragHandleIcon from 'lucide-react/dist/esm/icons/grip-horizontal';
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';

import { call } from '../../utils/shared';
import Loader from '../../generic/Loader';
import { message, Alert } from '../../generic/message';
import { StateContext } from '../../LayoutContainer';
import FormField from '../../forms/FormField';

export default function MenuSettings() {
  const [loading, setLoading] = useState(true);
  const [localSettings, setLocalSettings] = useState(null);
  const { currentUser, currentHost, platform, role, getCurrentHost } = useContext(StateContext);
  const [t] = useTranslation('admin');
  const [tc] = useTranslation('common');

  if (!currentUser || role !== 'admin') {
    return <Alert>{tc('message.accesss.deny')}</Alert>;
  }

  useEffect(() => {
    if (!currentHost) {
      return;
    }
    handleSetLocalSettings();
    setLoading(false);
  }, []);

  const handleSetLocalSettings = () => {
    const theLocalSettings = currentHost?.settings;
    // if (currentHost?.isPortalHost && platform?.isFederationLayout) {
    //   if (!currentHost?.settings?.menu?.some((item) => item.name === 'communities')) {
    //     theLocalSettings.menu.push({
    //       description: '',
    //       label: 'Communities',
    //       name: 'communities',
    //       isVisible: true,
    //     });
    //   }
    // }
    setLocalSettings(theLocalSettings);
  };

  const handleSwitchHeaderMenu = (checked) => {
    setLocalSettings({
      ...localSettings,
      isHeaderMenu: checked,
    });
  };

  const handleMenuItemCheck = (changedItemIndex, value) => {
    const newMenu = localSettings.menu.map((item, index) => {
      if (changedItemIndex === index) {
        return {
          ...item,
          isVisible: value,
        };
      }
      return item;
    });
    setLocalSettings({ ...localSettings, menu: newMenu });
  };

  const handleMenuItemLabelChange = (changedItemIndex, value) => {
    const newMenu = localSettings.menu.map((item, index) => {
      if (changedItemIndex === index) {
        return {
          ...item,
          label: value,
        };
      }
      return item;
    });
    setLocalSettings({ ...localSettings, menu: newMenu });
  };

  const handleMenuItemDescriptionChange = (changedItemIndex, value) => {
    const newMenu = localSettings.menu.map((item, index) => {
      if (changedItemIndex === index) {
        return {
          ...item,
          description: value,
        };
      }
      return item;
    });
    setLocalSettings({ ...localSettings, menu: newMenu });
  };

  const onSortMenuEnd = ({ oldIndex, newIndex }) => {
    const { menu } = localSettings;
    const visibleItems = menu.filter((item) => item.isVisible);
    const invisibleItems = menu.filter((item) => !item.isVisible);
    const newSettings = {
      ...localSettings,
      menu: [...arrayMove(visibleItems, oldIndex, newIndex), ...invisibleItems],
    };
    setLocalSettings(newSettings);
  };

  const handleMenuSave = async () => {
    setLoading(true);
    try {
      await call('updateHostSettings', localSettings);
      getCurrentHost();
      message.success(tc('message.success.save', { domain: tc('domains.settings') }));
    } catch (error) {
      message.error(error.reason);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !localSettings || !localSettings.menu) {
    return <Loader />;
  }

  return (
    <Box>
      <Box mb="24">
        <Box mb="8">
          <Heading as="h4" fontSize="18px" mb="2">
            {t('menu.headerMenu.title')}
          </Heading>

          <Text mb="4">{t('menu.headerMenu.text')}</Text>

          <Flex>
            <Switch
              mr="2"
              mt="1"
              name="isHeaderMenu"
              isChecked={localSettings.isHeaderMenu}
              onChange={(event) => handleSwitchHeaderMenu(event.target.checked)}
            />

            <Box>
              <Text fontWeight="bold">{t('menu.headerMenu.label')}</Text>
            </Box>
          </Flex>

          <Flex justify="flex-end" pt="2">
            <Button
              isDisabled={currentHost?.settings?.isHeaderMenu === localSettings?.isHeaderMenu}
              onClick={() => handleMenuSave()}
            >
              {tc('actions.submit')}
            </Button>
          </Flex>
        </Box>

        <Box mb="8">
          <Heading as="h4" fontSize="18px" mb="2">
            {t('menu.tabs.menuitems.label')}
          </Heading>

          <Text mb="4">{t('menu.tabs.menuitems.info')}</Text>

          <MenuTable
            menu={localSettings.menu}
            t={t}
            handleMenuItemCheck={handleMenuItemCheck}
            handleMenuItemLabelChange={handleMenuItemLabelChange}
            handleMenuItemDescriptionChange={handleMenuItemDescriptionChange}
          />

          <Flex justify="flex-end" py="4">
            <Button onClick={handleMenuSave}>{tc('actions.submit')}</Button>
          </Flex>
        </Box>

        <Box>
          <Heading as="h4" fontSize="18px" mb="2">
            {t('settings.tabs.menuOrder')}
          </Heading>

          <Text mb="4">{t('menu.tabs.order.info')}</Text>

          <Box>
            {localSettings && localSettings.menu && (
              <SortableContainer onSortEnd={onSortMenuEnd} helperClass="sortableHelper">
                {localSettings.menu
                  .filter((item) => item.isVisible)
                  .map((value, index) => (
                    <SortableItem key={`item-${value.name}`} index={index} value={value.label} />
                  ))}
              </SortableContainer>
            )}
          </Box>

          <Flex justify="flex-end" my="4">
            <Button onClick={handleMenuSave} type="submit">
              {tc('actions.submit')}
            </Button>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
}

function MenuTable({
  menu,
  t,
  handleMenuItemCheck,
  handleMenuItemLabelChange,
  handleMenuItemDescriptionChange,
}) {
  return (
    <Accordion allowToggle>
      {menu.map((item, index) => (
        <AccordionItem key={item.name}>
          <AccordionButton _expanded={{ bg: 'brand.600', color: '#fff' }} bg="white">
            <Box as="span" flex="1" textAlign="left" textTransform="capitalize">
              {item.label}
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel bg="brand.50" pb={4}>
            <Box pb="2" pt="1">
              <Code fontSize="md" fontWeight="bold">
                /{item.name}
              </Code>
              <Text fontWeight="light" mb="2" mt="1" textTransform="none">
                {t(`menu.info.${item.name}`)}
              </Text>
              <Table size="sm" variant="simple" w="100%">
                <Tbody>
                  <Tr key={item.name}>
                    <Td w="120px">
                      <Text>Active</Text>
                    </Td>
                    <Td px="0">
                      <Switch
                        isChecked={item.isVisible}
                        onChange={(event) => handleMenuItemCheck(index, event.target.checked)}
                      />
                    </Td>
                  </Tr>
                  <Tr>
                    <Td w="120px">
                      <Text>Label</Text>
                    </Td>
                    <Td px="0">
                      <FormField>
                        <Input
                          isDisabled={!item.isVisible}
                          size="sm"
                          value={item.label}
                          onChange={(e) => handleMenuItemLabelChange(index, e.target.value)}
                        />
                      </FormField>
                    </Td>
                  </Tr>
                  <Tr>
                    <Td w="120px">
                      <Text>Description</Text>
                    </Td>
                    <Td px="0">
                      <FormField>
                        <Textarea
                          isDisabled={!item.isVisible}
                          size="sm"
                          value={item.description}
                          onChange={(e) => handleMenuItemDescriptionChange(index, e.target.value)}
                        />
                      </FormField>
                    </Td>
                  </Tr>
                </Tbody>
              </Table>
            </Box>
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

const SortableItem = sortableElement(({ value }) => (
  <Flex align="center" bg="gray.100" cursor="move" mb="4" p="2">
    <DragHandleIcon /> <Box pl="2">{value}</Box>
  </Flex>
));

const SortableContainer = sortableContainer(({ children }) => <Box>{children}</Box>);
