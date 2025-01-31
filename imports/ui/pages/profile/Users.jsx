import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';

import { StateContext } from '../../LayoutContainer';
import { message } from '../../generic/message';
import { call } from '../../utils/shared';
import UsersHybrid from '../../listing/UsersHybrid';

export default function Users() {
  const initialUsers = window?.__PRELOADED_STATE__?.users || [];
  const initialKeywords = window?.__PRELOADED_STATE__?.keywords || [];
  const Host = window?.__PRELOADED_STATE__?.Host || null;

  const [users, setUsers] = useState(initialUsers);
  const [keywords, setKeywords] = useState(initialKeywords);
  let { currentHost } = useContext(StateContext);
  const [searchParams] = useSearchParams();
  const showKeywordSearch = Boolean(searchParams.get('showKeywordSearch'));

  if (!currentHost) {
    currentHost = Host;
  }

  const isPortalHost = Boolean(currentHost?.isPortalHost);

  const getAllUsers = async () => {
    try {
      if (users.length > 0) {
        return;
      }
      let usersFetched = [];
      if (isPortalHost) {
        usersFetched = await call('getAllMembersFromAllHosts');
      } else {
        usersFetched = await call('getHostMembers');
      }
      setUsers(usersFetched);
    } catch (error) {
      console.log(error);
      message.error(error.reason);
    }
  };

  const getKeywords = async () => {
    try {
      const respond = await call('getKeywords');
      const selectedKeywords = respond.filter((k) =>
        users.some((m) => m?.keywords?.map((kw) => kw.keywordId).includes(k._id))
      );
      setKeywords(selectedKeywords.sort((a, b) => a.label.localeCompare(b.label)));
    } catch (error) {
      console.log(error);
      message.error(error.reason);
    }
  };

  const getData = async () => {
    await getAllUsers();
    await getKeywords();
  };

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    getKeywords();
  }, [showKeywordSearch]);

  if (!users || !keywords) {
    return null;
  }

  return <UsersHybrid Host={Host} keywords={keywords} users={users} />;
}
