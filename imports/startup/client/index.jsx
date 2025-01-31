import { Meteor } from 'meteor/meteor';
import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { onPageLoad } from 'meteor/server-render';
import { ChakraProvider } from '@chakra-ui/react';

import '../i18n';
import AppRoutes from '../../ui/pages/Routes';
import SetupHome from '../../ui/pages/setup';
import { call } from '../../ui/utils/shared';

onPageLoad(async () => {
  const container = document.getElementById('root');

  const platform = await Meteor.callAsync('getPlatform');
  const currentHost = await call('getCurrentHost');

  if (!platform || !currentHost) {
    const root = createRoot(container);
    root.render(
      <ChakraProvider>
        <BrowserRouter>
          <SetupHome />
        </BrowserRouter>
      </ChakraProvider>
    );
    return;
  }

  hydrateRoot(
    container,
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
});
