import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Box, Anchor, Avatar, DropButton, List, Text } from 'grommet';

export const userRoutes = [
  { label: 'Profile', value: '/my-profile' },
  { label: 'Works', value: '/my-works' },
];

export const adminRoutes = [
  { label: 'Settings', value: '/admin/settings' },
  { label: 'Members', value: '/admin/members' },
];

const UserPopup = withRouter(({ currentUser, history }) => {
  if (!currentUser) {
    return (
      <Box justify="center" pad="small">
        <Anchor
          onClick={() => history.push('/signup')}
          label={
            <Box margin={{ top: 'small' }}>
              {' '}
              <Text>Login / Signup</Text>
            </Box>
          }
        />
      </Box>
    );
  }

  const [open, setOpen] = useState(false);

  return (
    <DropButton
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => setOpen(true)}
      dropAlign={{ right: 'right', top: 'bottom' }}
      dropContent={
        <Box pad="medium" width="small">
          <Box>
            <Text size="small" weight="bold">
              User
            </Text>
            <List data={userRoutes} border={false} pad="small">
              {(datum, index) => (
                <Anchor
                  onClick={() => history.push(datum.value)}
                  label={
                    <Text
                      margin={{ bottom: 'medium' }}
                      textAlign="end"
                      color="dark-2"
                    >
                      {datum.label}
                    </Text>
                  }
                />
              )}
            </List>
          </Box>
          {currentUser.isSuperAdmin && (
            <Box margin={{ top: 'medium' }}>
              <Text size="small" weight="bold">
                Admin
              </Text>
              <List data={adminRoutes} border={false} pad="small">
                {(datum, index) => (
                  <Anchor
                    onClick={() => history.push(datum.value)}
                    label={
                      <Text
                        margin={{ bottom: 'medium' }}
                        textAlign="end"
                        color="dark-2"
                      >
                        {datum.label}
                      </Text>
                    }
                  />
                )}
              </List>
            </Box>
          )}
        </Box>
      }
    >
      <Box justify="center" pad="small">
        <Avatar
          src={currentUser.avatar && currentUser.avatar.src}
          elevation={open ? 'large' : 'medium'}
        />
      </Box>
    </DropButton>
  );
});

export default UserPopup;
