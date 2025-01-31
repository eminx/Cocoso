import { Meteor } from 'meteor/meteor';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

import { message } from '../../generic/message';
import Paginate from '../../listing/Paginate';
import NewGridThumb from '../../listing/NewGridThumb';

function MemberActivities({ currentHost, user }) {
  const [activities, setActivities] = useState([]);

  const username = user?.username;

  useEffect(() => {
    if (!user || !username) {
      return;
    }
    Meteor.call('getActivitiesByUser', username, (error, respond) => {
      if (error) {
        message(error);
        return;
      }
      setActivities(respond);
    });
  }, []);

  if (!user || !username || !activities || activities.length === 0) {
    return null;
  }

  const publicActivities = activities.filter((item) => item.isPublicActivity);
  const isPortalHost = currentHost?.isPortalHost;

  return (
    <Paginate items={publicActivities}>
      {(activity) => {
        const isExternal = activity.host !== currentHost.host;
        return (
          <Box key={activity._id}>
            {isExternal ? (
              <a href={`https://${activity.host}/activities/${activity._id}/info`}>
                <NewGridThumb
                  host={isPortalHost && activity.host}
                  imageUrl={activity.imageUrl}
                  title={activity.title}
                  subTitle={activity.isGroup ? activity.readingMaterial : activity.subTitle}
                />
              </a>
            ) : (
              <Link to={`/activities/${activity._id}/info`}>
                <NewGridThumb
                  host={isPortalHost && activity.host}
                  imageUrl={activity.imageUrl}
                  title={activity.title}
                  subTitle={activity.isGroup ? activity.readingMaterial : activity.subTitle}
                />
              </Link>
            )}
          </Box>
        );
      }}
    </Paginate>
  );
}

export default MemberActivities;
