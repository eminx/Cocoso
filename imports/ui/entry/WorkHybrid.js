import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import parseHtml from 'html-react-parser';

import TablyCentered from './TablyCentered';
import DocumentsField from '../pages/resources/components/DocumentsField';

export default function WorkHybrid({ documents, work, Host }) {
  const [tc] = useTranslation('common');

  if (!work) {
    return null;
  }

  const tabs = [
    {
      title: tc('labels.info'),
      content: (
        <Box bg="white" className="text-content" p="6">
          {work?.longDescription && parseHtml(work?.longDescription)}
        </Box>
      ),
      path: 'info',
    },
  ];

  if (work.additionalInfo?.length > 2) {
    tabs.push({
      title: tc('labels.extra'),
      content: (
        <Box bg="white" p="4">
          <Text textAlign="center">{work?.additionalInfo}</Text>
        </Box>
      ),
      path: 'extra',
    });
  }

  if (documents && documents[0]) {
    tabs.push({
      title: tc('documents.label'),
      content: (
        <Box p="4">
          <DocumentsField contextType="works" contextId={work?._id} />
        </Box>
      ),
      path: 'documents',
    });
  }

  if (work.contactInfo) {
    tabs.push({
      title: tc('labels.contact'),
      content: (
        <Box bg="white" className="text-content" p="4" textAlign="center">
          {work?.contactInfo && parseHtml(work.contactInfo)}
        </Box>
      ),
      path: 'contact',
    });
  }

  // const isOwner = currentUser && currentUser.username === username;

  // const adminMenu = {
  //   label: 'Admin',
  //   items: [
  //     {
  //       label: tc('actions.update'),
  //       link: 'edit',
  //     },
  //   ],
  // };

  const tags = work && [work.category?.label];
  const worksInMenu = Host.settings?.menu.find((item) => item.name === 'works');

  return (
    <TablyCentered
      action={null}
      adminMenu={null}
      author={
        work.showAvatar && {
          src: work.authorAvatar,
          username: work.authorUsername,
        }
      }
      backLink={{ value: '/works', label: worksInMenu.label }}
      images={work?.images || [work.imageUrl]}
      subTitle={work.shortDescription}
      tabs={tabs}
      tags={tags}
      title={work.title}
    />
  );
}
