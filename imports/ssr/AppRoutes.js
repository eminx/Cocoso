import React from 'react';
import { ChakraProvider, Progress } from '@chakra-ui/react';

import generateTheme from '../ui/utils/constants/theme';

import {
  ActivitiesList,
  Activity,
  Communities,
  Home,
  GroupsList,
  Group,
  Page,
  ResourcesList,
  Resource,
  WorksList,
  Work,
  UsersList,
  User,
} from './components';

function LoaderSSR() {
  const chakraTheme = generateTheme('233');

  return (
    <ChakraProvider theme={chakraTheme}>
      <Progress size="xs" isIndeterminate colorScheme="blue" />
    </ChakraProvider>
  );
}

const AppRoutesSSR = (host, sink) => {
  const props = {
    host,
    sink,
  };

  return [
    {
      path: '/',
      element: <Home {...props} />,
    },
    {
      path: '/activities',
      element: <ActivitiesList {...props} />,
    },
    {
      path: '/groups',
      element: <GroupsList {...props} />,
    },
    {
      path: '/resources',
      element: <ResourcesList {...props} />,
    },
    {
      path: '/works',
      element: <WorksList {...props} />,
    },
    {
      path: '/people',
      element: <UsersList {...props} />,
    },
    {
      path: '/communities',
      element: <Communities {...props} />,
    },
    {
      path: '/calendar',
      element: <LoaderSSR />,
    },
    {
      path: '/activities/:activityId/*',
      element: <Activity {...props} />,
    },
    {
      path: '/groups/:groupId/*',
      element: <Group {...props} />,
    },
    {
      path: '/pages/:pageTitle',
      element: <Page {...props} />,
    },
    {
      path: '/resources/:resourceId/*',
      element: <Resource {...props} />,
    },
    {
      path: '/:usernameSlug/works/:workId/*',
      element: <Work {...props} />,
    },
    {
      path: '/:usernameSlug/*',
      element: <User {...props} />,
    },
    {
      path: '/*',
      element: <LoaderSSR />,
    },
  ];
};

export default AppRoutesSSR;
