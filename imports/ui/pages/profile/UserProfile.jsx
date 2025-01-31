import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Center } from '@chakra-ui/react';

import { call } from '../../utils/shared';
import UserHybrid from '../../entry/UserHybrid';
import Loader from '../../generic/Loader';
import { Alert } from '../../generic/message';
import { StateContext } from '../../LayoutContainer';

export default function UserProfile() {
  const initialUser = window?.__PRELOADED_STATE__?.user || null;
  const Host = window?.__PRELOADED_STATE__?.Host || null;

  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(true);
  const [ta] = useTranslation('accounts');
  const { usernameSlug } = useParams();
  const [, username] = usernameSlug.split('@');

  let { currentHost } = useContext(StateContext);

  if (!currentHost) {
    currentHost = Host;
  }

  const getUserInfo = async () => {
    try {
      const respond = await call('getUserInfo', username);
      setUser(respond);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, [username]);

  if (usernameSlug[0] !== '@') {
    return null;
  }

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <Center p="8">
        <Alert message={ta('profile.message.notfound')} />
      </Center>
    );
  }

  return <UserHybrid user={user} Host={currentHost} />;
}
