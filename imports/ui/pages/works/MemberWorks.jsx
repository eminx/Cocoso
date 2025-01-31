import { Meteor } from 'meteor/meteor';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

import { message } from '../../generic/message';
import Paginate from '../../listing/Paginate';
import NewGridThumb from '../../listing/NewGridThumb';

function MemberWorks({ currentHost, user }) {
  const [works, setWorks] = useState([]);

  const username = user?.username;

  useEffect(() => {
    Meteor.call('getWorksByUser', username, (error, respond) => {
      if (error) {
        message(error);
        return;
      }
      setWorks(respond);
    });
  }, []);

  if (!user || !username || !works || works.length === 0) {
    return null;
  }

  const isPortalHost = currentHost?.isPortalHost;

  return (
    <Paginate items={works}>
      {(work) => {
        const isExternal = work.host !== currentHost.host;
        return (
          <Box key={work._id}>
            {isExternal ? (
              <a href={`https://${work.host}/@${work.authorUsername}/works/${work._id}/info`}>
                <NewGridThumb
                  avatar={{
                    name: work.authorUsername,
                    url: work.authorAvatar,
                  }}
                  host={isPortalHost && work.host}
                  imageUrl={work.images[0]}
                  tag={work.category?.label}
                  title={work.title}
                />
              </a>
            ) : (
              <Link to={`/@${work.authorUsername}/works/${work._id}/info`}>
                <NewGridThumb
                  avatar={{
                    name: work.authorUsername,
                    url: work.authorAvatar,
                  }}
                  host={isPortalHost && work.host}
                  imageUrl={work.images[0]}
                  tag={work.category?.label}
                  title={work.title}
                />
              </Link>
            )}
          </Box>
        );
      }}
    </Paginate>
  );
}

export default MemberWorks;
