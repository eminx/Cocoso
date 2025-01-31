import React, { useContext, useEffect, useState } from 'react';

import { StateContext } from '../../LayoutContainer';
import { call } from '../../utils/shared';
import { message } from '../../generic/message';
import GroupsHybrid from '../../listing/GroupsHybrid';

export default function Groups() {
  const initialGroups = window?.__PRELOADED_STATE__?.groups || [];
  const Host = window?.__PRELOADED_STATE__?.Host || null;

  const [groups, setGroups] = useState(initialGroups);
  let { currentHost } = useContext(StateContext);

  if (!currentHost) {
    currentHost = Host;
  }

  const isPortalHost = Boolean(currentHost?.isPortalHost);

  const getGroups = async () => {
    try {
      const parsedGroups = await call('getGroupsWithMeetings', isPortalHost);
      setGroups(parsedGroups);
    } catch (error) {
      message.error(error.reason);
      console.log(error);
    }
  };

  useEffect(() => {
    getGroups();
  }, []);

  if (!groups) {
    return null;
  }

  return <GroupsHybrid groups={groups} Host={currentHost} />;
}
