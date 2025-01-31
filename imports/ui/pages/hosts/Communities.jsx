import React, { useContext, useEffect, useLayoutEffect, useState } from 'react';

import { StateContext } from '../../LayoutContainer';
import { call } from '../../utils/shared';
import { message } from '../../generic/message';
import CommunitiesHybrid from './CommunitiesHybrid';

function Communities() {
  const initialHosts = window?.__PRELOADED_STATE__?.hosts || [];
  const Host = window?.__PRELOADED_STATE__?.Host || null;

  const [hosts, setHosts] = useState(initialHosts);
  const [rendered, setRendered] = useState(false);
  let { currentHost } = useContext(StateContext);
  const { currentUser } = useContext(StateContext);

  if (!currentHost) {
    currentHost = Host;
  }

  const getHosts = async () => {
    try {
      const allHosts = await call('getAllHosts');
      setHosts(allHosts);
    } catch (error) {
      console.log(error);
      message.error(error.reason);
    }
  };

  useEffect(() => {
    getHosts();
  }, []);

  useLayoutEffect(() => {
    setRendered(true);
  }, []);

  if (!hosts) {
    return null;
  }

  return (
    <CommunitiesHybrid
      currentUser={rendered ? currentUser : null}
      hosts={hosts}
      Host={currentHost}
    />
  );
}

export default Communities;
