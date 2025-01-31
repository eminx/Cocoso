import React from 'react';
import { Box, Center } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import parseHtml from 'html-react-parser';

import TablyCentered from './TablyCentered';
import GroupDocuments from '../pages/groups/components/GroupDocuments';
import GroupMembers from '../pages/groups/components/GroupMembers';

export default function GroupHybrid({ group, Host }) {
  const [tc] = useTranslation('common');

  if (!group) {
    return null;
  }

  const tabs = [
    {
      title: tc('labels.info'),
      content: (
        <Box bg="white" className="text-content" p="6">
          {group?.description && parseHtml(group?.description)}
        </Box>
      ),
      path: 'info',
    },
  ];

  if (group.documents && group.documents.length > 0) {
    tabs.push({
      title: tc('documents.label'),
      content: <GroupDocuments documents={group.documents} />,
      path: 'documents',
    });
  }

  const groupsInMenu = Host.settings?.menu.find((item) => item.name === 'groups');

  return (
    <TablyCentered
      action={
        <Center>
          <GroupMembers group={group} />
        </Center>
      }
      adminMenu={null}
      backLink={{ value: '/groups', label: groupsInMenu?.label }}
      images={[group.imageUrl]}
      subTitle={group.readingMaterial}
      tabs={tabs}
      title={group.title}
    />
  );
}
