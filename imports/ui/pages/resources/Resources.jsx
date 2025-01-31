import React, { useState, useEffect, useContext } from 'react';

import { StateContext } from '../../LayoutContainer';
import { message } from '../../generic/message';
import { call } from '../../utils/shared';
import ResourcesHybrid from '../../listing/ResourcesHybrid';

export default function Resources() {
  const initialResources = window?.__PRELOADED_STATE__?.resources || [];
  const Host = window?.__PRELOADED_STATE__?.Host || null;

  const [resources, setResources] = useState(initialResources);
  let { currentHost } = useContext(StateContext);

  if (!currentHost) {
    currentHost = Host;
  }

  const isPortalHost = Boolean(currentHost?.isPortalHost);

  const getAllResources = async () => {
    try {
      if (isPortalHost) {
        setResources(await call('getResourcesFromAllHosts'));
      } else {
        setResources(await call('getResources'));
      }
    } catch (error) {
      message.error(error.reason);
    }
  };

  useEffect(() => {
    getAllResources();
  }, []);

  if (!resources) {
    return null;
  }

  return <ResourcesHybrid Host={currentHost} resources={resources} />;
}
