import { Meteor } from 'meteor/meteor';
import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { parse } from 'query-string';

import WrapperSSR from '../../ui/layout/WrapperSSR';
import ActivityHybrid from '../../ui/entry/ActivityHybrid';
import GroupsHybrid from '../../ui/listing/GroupsHybrid';
import GroupHybrid from '../../ui/entry/GroupHybrid';
import ResourcesHybrid from '../../ui/listing/ResourcesHybrid';
import ResourceHybrid from '../../ui/entry/ResourceHybrid';
import WorksHybrid from '../../ui/listing/WorksHybrid';
import WorkHybrid from '../../ui/entry/WorkHybrid';
import UsersHybrid from '../../ui/listing/UsersHybrid';
import PageHybrid from '../../ui/entry/PageHybrid';
import ActivitiesHybrid from '../../ui/listing/ActivitiesHybrid';
import CommunitiesHybrid from '../../ui/pages/hosts/CommunitiesHybrid';

export function ActivitiesList({ host, sink }) {
  const location = useLocation();
  const { search } = location;
  const { showPast } = parse(search, { parseBooleans: true });

  const Host = Meteor.call('getHost', host);
  const activities = Host.isPortalHost
    ? Meteor.call('getAllPublicActivitiesFromAllHosts', Boolean(showPast))
    : Meteor.call('getAllPublicActivities', Boolean(showPast), host);

  sink.appendToBody(`
    <script>
      window.__PRELOADED_STATE__ = ${JSON.stringify({ activities, Host }).replace(/</g, '\\u003c')}
    </script>
  `);

  if (!Host) {
    return null;
  }

  return (
    <WrapperSSR Host={Host}>
      <ActivitiesHybrid activities={activities} Host={Host} showPast={Boolean(showPast)} />
    </WrapperSSR>
  );
}

export function Activity({ host, sink }) {
  const { activityId } = useParams();
  const activity = Meteor.call('getActivityById', activityId);
  const Host = Meteor.call('getHost', host);

  sink.appendToBody(`
    <script>
      window.__PRELOADED_STATE__ = ${JSON.stringify({ activity, Host }).replace(/</g, '\\u003c')}
    </script>
  `);

  if (!activity) {
    return null;
  }

  return (
    <WrapperSSR isEntryPage Host={Host}>
      <ActivityHybrid activity={activity} Host={Host} />
    </WrapperSSR>
  );
}

export function GroupsList({ host, sink }) {
  const Host = Meteor.call('getHost', host);
  const groups = Meteor.call('getGroupsWithMeetings', Host?.isPortalHost, host);

  sink.appendToBody(`
    <script>
      window.__PRELOADED_STATE__ = ${JSON.stringify({ groups, Host }).replace(/</g, '\\u003c')}
    </script>
  `);

  return (
    <WrapperSSR Host={Host}>
      <GroupsHybrid groups={groups} Host={Host} />
    </WrapperSSR>
  );
}

export function Group({ host, sink }) {
  const { groupId } = useParams();
  const group = Meteor.call('getGroupWithMeetings', groupId);
  const Host = Meteor.call('getHost', host);

  sink.appendToBody(`
    <script>
      window.__PRELOADED_STATE__ = ${JSON.stringify({ group, Host }).replace(/</g, '\\u003c')}
    </script>
  `);

  if (!group) {
    return null;
  }

  return (
    <WrapperSSR isEntryPage Host={Host}>
      <GroupHybrid group={group} Host={Host} />
    </WrapperSSR>
  );
}

export function ResourcesList({ host, sink }) {
  const Host = Meteor.call('getHost', host);
  const resources = Host.isPortalHost
    ? Meteor.call('getResourcesFromAllHosts')
    : Meteor.call('getResources', host);

  sink.appendToBody(`
    <script>
      window.__PRELOADED_STATE__ = ${JSON.stringify({ resources, Host }).replace(/</g, '\\u003c')}
    </script>
  `);

  return (
    <WrapperSSR Host={Host}>
      <ResourcesHybrid Host={Host} resources={resources} />
    </WrapperSSR>
  );
}

export function Resource({ host, sink }) {
  const { resourceId } = useParams();
  const resource = Meteor.call('getResourceById', resourceId);
  const documents = Meteor.call('getDocumentsByAttachments', resourceId);
  const Host = Meteor.call('getHost', host);

  sink.appendToBody(`
    <script>
      window.__PRELOADED_STATE__ = ${JSON.stringify({ documents, resource, Host }).replace(
        /</g,
        '\\u003c'
      )}
    </script>
  `);

  if (!resource) {
    return null;
  }

  return (
    <WrapperSSR isEntryPage Host={Host}>
      <ResourceHybrid documents={documents} resource={resource} Host={Host} />
    </WrapperSSR>
  );
}

export function WorksList({ host, sink }) {
  const Host = Meteor.call('getHost', host);
  const works = Host.isPortalHost
    ? Meteor.call('getAllWorksFromAllHosts')
    : Meteor.call('getAllWorks', host);

  sink.appendToBody(`
    <script>
      window.__PRELOADED_STATE__ = ${JSON.stringify({ works, Host }).replace(/</g, '\\u003c')}
    </script>
  `);

  return (
    <WrapperSSR Host={Host}>
      <WorksHybrid Host={Host} works={works} />
    </WrapperSSR>
  );
}

export function Work({ host, sink }) {
  const { workId, usernameSlug } = useParams();
  const [, username] = usernameSlug.split('@');
  const work = Meteor.call('getWork', workId, username);
  const documents = Meteor.call('getDocumentsByAttachments', workId);
  const Host = Meteor.call('getHost', host);

  if (!work) {
    return null;
  }

  sink.appendToBody(`
    <script>
      window.__PRELOADED_STATE__ = ${JSON.stringify({ work, Host }).replace(/</g, '\\u003c')}
    </script>
  `);

  return (
    <WrapperSSR isEntryPage Host={Host}>
      <WorkHybrid documents={documents} work={work} Host={Host} />
    </WrapperSSR>
  );
}

export function Page({ host, sink }) {
  const pages = Meteor.call('getPages', host);
  const Host = Meteor.call('getHost', host);

  if (!pages) {
    return null;
  }

  sink.appendToBody(`
    <script>
      window.__PRELOADED_STATE__ = ${JSON.stringify({ pages, Host }).replace(/</g, '\\u003c')}
    </script>
  `);

  return (
    <WrapperSSR isEntryPage Host={Host}>
      <PageHybrid pages={pages} Host={Host} />
    </WrapperSSR>
  );
}

export function UsersList({ host, sink }) {
  const Host = Meteor.call('getHost', host);
  const users = Host.isPortalHost
    ? Meteor.call('getAllMembersFromAllHosts')
    : Meteor.call('getHostMembers', host);

  const keywords = Meteor.call('getKeywords');

  sink.appendToBody(`
    <script>
      window.__PRELOADED_STATE__ = ${JSON.stringify({ keywords, users, Host }).replace(
        /</g,
        '\\u003c'
      )}
    </script>
  `);

  return (
    <WrapperSSR Host={Host}>
      <UsersHybrid Host={Host} keywords={keywords} users={users} />
    </WrapperSSR>
  );
}

export function User({ host, sink }) {
  const Host = Meteor.call('getHost', host);
  const { usernameSlug } = useParams();
  if (usernameSlug[0] !== '@') {
    return null;
  }
  const [, username] = usernameSlug.split('@');
  const user = Meteor.call('getUserInfo', username, host);

  sink.appendToBody(`
    <script>
      window.__PRELOADED_STATE__ = ${JSON.stringify({ user, Host }).replace(/</g, '\\u003c')}
    </script>
  `);

  return (
    <WrapperSSR isEntryPage Host={Host}>
      <UsersHybrid Host={Host} user={user} />
    </WrapperSSR>
  );
}

export function Communities({ host, sink }) {
  const Host = Meteor.call('getHost', host);
  const hosts = Meteor.call('getAllHosts');

  sink.appendToBody(`
    <script>
      window.__PRELOADED_STATE__ = ${JSON.stringify({ hosts, Host }).replace(/</g, '\\u003c')}
    </script>
  `);

  return (
    <WrapperSSR Host={Host}>
      <CommunitiesHybrid Host={Host} hosts={hosts} />
    </WrapperSSR>
  );
}

export function Home(props) {
  const host = props?.host;
  const Host = Meteor.call('getHost', host);

  if (!Host) {
    return null;
  }

  const getComponentBasedOnFirstRoute = () => {
    const menuItems = Host.settings?.menu;
    const visibleMenu = menuItems.filter((item) => item.isVisible);
    const firstRoute = visibleMenu && visibleMenu[0].name;

    switch (firstRoute) {
      case 'activities':
        return <ActivitiesList {...props} />;
      case 'groups':
        return <GroupsList {...props} />;
      case 'works':
        return <WorksList {...props} />;
      case 'resources':
        return <ResourcesList {...props} />;
      case 'info':
        return <Page {...props} />;
      default:
        return <UsersList {...props} />;
    }
  };

  const Component = getComponentBasedOnFirstRoute();

  return Component;
}
