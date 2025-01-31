import { Meteor } from 'meteor/meteor';
import React, { useContext, useEffect, useState } from 'react';

import PageHybrid from '../../entry/PageHybrid';
import { StateContext } from '../../LayoutContainer';

function Page() {
  const initialPages = window?.__PRELOADED_STATE__?.pages || [];
  const Host = window?.__PRELOADED_STATE__?.Host || null;

  const [pages, setPages] = useState(initialPages);
  let { currentHost } = useContext(StateContext);

  if (!currentHost) {
    currentHost = Host;
  }

  useEffect(() => {
    Meteor.call('getPages', (error, respond) => {
      setPages(respond);
    });
  }, []);

  return <PageHybrid pages={pages} Host={currentHost} />;
}

export default Page;
