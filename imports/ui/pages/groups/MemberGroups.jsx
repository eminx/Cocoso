import { Meteor } from 'meteor/meteor';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

import { message } from '../../generic/message';
import Paginate from '../../listing/Paginate';
import NewGridThumb from '../../listing/NewGridThumb';

function MemberGroups({ currentHost, user }) {
  const [groups, setGroups] = useState([]);

  const username = user?.username;

  useEffect(() => {
    if (!user || !username) {
      return;
    }
    Meteor.call('getGroupsByUser', username, (error, respond) => {
      if (error) {
        message(error);
        return;
      }
      setGroups(respond);
    });
  }, []);

  if (!user || !username || !groups || groups.length === 0) {
    return null;
  }

  const isPortalHost = currentHost?.isPortalHost;

  return (
    <Paginate items={groups}>
      {(group) => {
        const isExternal = group.host !== currentHost.host;
        return (
          <Box key={group._id}>
            {isExternal ? (
              <a href={`https://${group.host}/groups/${group._id}/info`}>
                <NewGridThumb
                  host={isPortalHost && group.host}
                  imageUrl={group.imageUrl}
                  subTitle={group.readingMaterial}
                  title={group.title}
                />
              </a>
            ) : (
              <Link to={`/groups/${group._id}/info`}>
                <NewGridThumb
                  host={isPortalHost && group.host}
                  imageUrl={group.imageUrl}
                  subTitle={group.readingMaterial}
                  title={group.title}
                />
              </Link>
            )}
          </Box>
        );
      }}
    </Paginate>
  );
}

export default MemberGroups;
