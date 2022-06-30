import React, { lazy, Suspense } from 'react';
import { Switch, Router, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { Progress } from '@chakra-ui/react';

import Home from '../Home';
import LayoutContainer from '../LayoutContainer';
import ResourceRoutes from './resources/ResourceRouter';
import ProcessRoutes from './processes/ProcessRouter';
import ActivityRoutes from './activities/ActivitiyRouter';
import PageRoutes from './pages/PageRouter';

// ROUTES
const browserHistory = createBrowserHistory();
// Calendar
const CalendarContainer = lazy(() => import('./CalendarContainer'));
// Works
const Works = lazy(() => import('./works/Works'));
const NewWork = lazy(() => import('./works/NewWork'));
const EditWork = lazy(() => import('./works/EditWork'));
const Work = lazy(() => import('./works/Work'));
// Members
const MembersPublic = lazy(() => import('./members/MembersPublic'));
// User Related
const MemberPublic = lazy(() => import('./members/Member'));
const ProfileContainer = lazy(() => import('./profile/ProfileContainer'));
const MyActivities = lazy(() => import('./activities/MyActivities'));
const MyWorks = lazy(() => import('./works/MyWorks'));
// Admin
const Settings = lazy(() => import('./admin/Settings'));
const Members = lazy(() => import('./admin/Members'));
const Emails = lazy(() => import('./admin/Emails'));
// Auth
const SignupPage = lazy(() => import('./auth/SignupPage'));
const LoginPage = lazy(() => import('./auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('./auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./auth/ResetPasswordPage'));
const VerifyEmail = lazy(() => import('./auth/VerifyEmailPage'));
// SuperAdmin
const NewHost = lazy(() => import('./hosts/NewHost'));
// NotFound
const NotFoundPage = lazy(() => import('./NotFoundPage'));

export default function () {
  return (
    <Router history={browserHistory}>
      <Switch>
        <LayoutContainer history={browserHistory}>
          <Suspense fallback={<Progress size="xs" colorScheme="pink" isIndeterminate />}>
            <Switch>
              {/* Home */}
              <Route exact path="/" component={Home} />
              {/* Members list public */}
              <Route exact path="/members" component={MembersPublic} />
              {/* Calendar */}
              <Route exact path="/calendar" component={CalendarContainer} />
              {/* Activities */}
              <ActivityRoutes path="/activities" history={browserHistory} />
              {/* Processes */}
              <ProcessRoutes path="/processes" history={browserHistory} />
              {/* Resources */}
              <ResourceRoutes path="/resources" history={browserHistory} />
              {/* Pages */}
              <PageRoutes path="/pages" history={browserHistory} />
              {/* Works */}
              <Switch path="/works">
                <Route exact path="/works" component={Works} />
                <Route exact path="/works/new" component={NewWork} history={browserHistory} />
              </Switch>
              {/* Profile & Profile Related Pages */}
              <Switch path="/@:username">
                <Route
                  path="/@:username/works/:workId/edit"
                  component={EditWork}
                  history={browserHistory}
                />
                <Route path="/@:username/works/:workId" component={Work} />
                <Route path="/@:username/works" component={MyWorks} />
                <Route path="/@:username/activities" component={MyActivities} />
                <Route path="/@:username/profile" component={ProfileContainer} />
                <Route path="/@:username" component={MemberPublic} />
              </Switch>
              {/* Admin */}
              <Switch path="/admin">
                <Route exact path="/admin/settings" component={Settings} />
                <Route exact path="/admin/members" component={Members} />
                <Route exact path="/admin/emails" component={Emails} />
              </Switch>
              {/* Auth */}
              <Route exact path="/signup" component={SignupPage} />
              <Route exact path="/login" component={LoginPage} />
              <Route exact path="/forgot-password" component={ForgotPasswordPage} />
              <Route path="/reset-password/:token" component={ResetPasswordPage} />
              <Route path="/verify-email/:token" component={VerifyEmail} />
              {/* SuperAdmin */}
              <Route exact path="/new-host" component={NewHost} />
              {/* NotFoundPage */}
              <Route exact path="/not-found" component={NotFoundPage} />
              <Route exact path="/404" component={NotFoundPage} />
              <Route path="*">
                <NotFoundPage />
              </Route>
            </Switch>
          </Suspense>
        </LayoutContainer>
      </Switch>
    </Router>
  );
}
