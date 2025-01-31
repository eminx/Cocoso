import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

const Groups = lazy(() => import('./Groups'));
const NewGroup = lazy(() => import('./NewGroupContainer'));
const Group = lazy(() => import('./GroupContainer'));
const EditGroup = lazy(() => import('./EditGroupContainer'));

export default function GroupRoutes({ path, history }) {
  return (
    <Route path="/groups" component={Groups}>
      <Route exact path="/new" component={NewGroup} history={history} />
      <Route path="/:groupId/edit" component={EditGroup} history={history} />
      <Route path="/:groupId" component={Group} />
    </Route>
  );
}
