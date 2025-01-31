import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

const EditProfile = lazy(() => import('./EditProfile'));
const Work = lazy(() => import('../works/Work'));
const EditWork = lazy(() => import('../works/EditWork'));
const Profile = lazy(() => import('../../entry/UserHybrid'));

export default function PageRoutes({ path, history }) {
  return (
    <Route path="/@:username" history={history} component={Profile}>
      <Route path="/edit" component={EditProfile} />
      <Route path="/works/:workId/edit" component={EditWork} />
      <Route path="/works/:workId" component={Work} />
      <Route path="/:profileRoute" history={history} component={Profile} />
    </Route>
  );
}
