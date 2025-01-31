import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconButton } from '@chakra-ui/react';
import AddIcon from 'lucide-react/dist/esm/icons/plus-square';
import { StateContext } from '../LayoutContainer';

const getRoute = (item) => {
  if (item.name === 'info') {
    return '/pages/new';
  }
  return `/${item.name}/new`;
};

export default function NewButton() {
  const { canCreateContent, currentHost, currentUser, role } = useContext(StateContext);
  const location = useLocation();
  const navigate = useNavigate();

  const menu = currentHost?.settings.menu;

  if (!currentUser || !canCreateContent) {
    return null;
  }

  const isAdmin = role === 'admin';

  const menuItems = menu
    .filter((item) => {
      if (isAdmin) {
        return item.isVisible;
      }
      return item.isVisible && !['info', 'resources'].includes(item.name);
    })
    .map((item, index) => ({
      ...item,
      route: getRoute(item, index),
    }));

  const { pathname } = location;

  const isCurrentPage = (name) => {
    if (name === 'info') {
      return pathname.substring(0, 6) === '/pages';
    }
    return name === pathname?.substring(1, pathname.length);
  };

  const activeMenuItem = menuItems.find(
    (item) => isCurrentPage(item.name) && item.name !== 'people'
  );

  const getPathname = (item) => {
    if (item.name === 'calendar') {
      return '/activities/new';
    }
    if (item.name === 'info') {
      return '/pages/new';
    }
    if (item.name === 'communities' && currentUser?.isSuperAdmin) {
      return '/new-host';
    }
    return `/${item.name}/new`;
  };

  if (!canCreateContent) {
    return null;
  }

  if (!activeMenuItem || ['members', 'people'].includes(activeMenuItem.name)) {
    return null;
  }

  return (
    <IconButton
      _hover={{ bg: 'brand.200' }}
      as="span"
      bg="brand.100"
      borderColor="#fff"
      borderWidth="2px"
      borderRadius="8px"
      color="gray.800"
      cursor="pointer"
      icon={<AddIcon />}
      mx="2"
      size="sm"
      onClick={() => navigate(getPathname(activeMenuItem))}
    />
  );
}
