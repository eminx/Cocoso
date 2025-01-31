import React from 'react';
import { Badge, Box, Wrap } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import parseHtml from 'html-react-parser';

import TablyCentered from './TablyCentered';
import DocumentsField from '../pages/resources/components/DocumentsField';

export default function ResourceHybrid({ documents, resource, Host }) {
  const [t] = useTranslation('resources');
  const [tc] = useTranslation('common');

  if (!resource) {
    return null;
  }

  const tabs = [
    {
      title: tc('labels.info'),
      content: (
        <Box bg="white" className="text-content" p="6">
          {resource?.description && parseHtml(resource?.description)}
        </Box>
      ),
      path: 'info',
    },
  ];

  if (resource.isCombo) {
    tabs.push({
      title: tc('labels.combo'),
      content: (
        <Wrap>
          {resource.resourcesForCombo.map((res) => (
            <Badge key={res._id} fontSize="16px">
              {res.label}
            </Badge>
          ))}
        </Wrap>
      ),
      path: 'combo',
    });
  }

  if (documents && documents[0]) {
    tabs.push({
      title: tc('documents.label'),
      content: (
        <Box p="4">
          <DocumentsField contextType="works" contextId={resource?._id} />
        </Box>
      ),
      path: 'documents',
    });
  }

  // if (currentUser && canCreateContent && resource.isBookable) {
  //   tabs.push({
  //     title: t('booking.labels.field'),
  //     content: <BookingsField currentUser={currentUser} selectedResource={resource} />,
  //     path: 'bookings',
  //   });
  // }

  // const adminMenu = {
  //   label: 'Admin',
  //   items: [
  //     {
  //       label: tc('actions.update'),
  //       link: 'edit',
  //     },
  //   ],
  // };

  const tags = [];
  if (resource.isCombo) {
    tags.push(t('cards.isCombo'));
  }

  if (resource.isBookable) {
    tags.push(t('cards.isBookable'));
  }

  const resourcesInMenu = Host?.settings?.menu?.find((item) => item.name === 'resources');
  const backLink = {
    value: '/resources',
    label: resourcesInMenu?.label,
  };

  return (
    <TablyCentered
      action={null}
      adminMenu={null}
      backLink={backLink}
      images={resource?.images}
      tabs={tabs}
      tags={tags}
      title={resource.label}
    />
  );
}
