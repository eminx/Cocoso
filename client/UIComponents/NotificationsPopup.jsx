import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, List, Stack, DropButton, Text, Heading } from 'grommet';
import { Notification } from 'grommet-icons';

const NotificationsPopup = ({ notifications, count }) => {
  const [open, setOpen] = useState(false);
  if (!notifications) {
    return null;
  }

  let notificationsCounter = 0;
  if (notifications && notifications.length > 0) {
    notifications.forEach(notification => {
      notificationsCounter += notification.count;
    });
  }

  return (
    <DropButton
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      dropAlign={{ right: 'right', top: 'bottom' }}
      dropContent={<NotificationList notifications={notifications} />}
    >
      <Stack anchor="top-right">
        <Box justify="center" pad="small">
          <Notification />
        </Box>
        {notificationsCounter !== 0 && <Badge>{notificationsCounter}</Badge>}
      </Stack>
    </DropButton>
  );
};

const NotificationList = ({ notifications }) => (
  <Box>
    {notifications.length === 0 ? (
      <Text size="small"> You don't have unread messages</Text>
    ) : (
      <List
        size="small"
        data={notifications}
        // itemProps={{ pad: 'small' }}
        pad="small"
      >
        {item => (
          <Box>
            <Link to={`/${item.context}/${item.contextId}`}>
              <Stack anchor="top-right">
                <Heading level={4}>{item.title}</Heading>
                <Badge>{item.count}</Badge>
              </Stack>
            </Link>
          </Box>
        )}
      </List>
    )}
  </Box>
);

const Badge = ({ children }) => (
  <Box background="accent-4" pad={{ horizontal: 'xsmall' }} round>
    <Text size="small">{children}</Text>
  </Box>
);

export default NotificationsPopup;
