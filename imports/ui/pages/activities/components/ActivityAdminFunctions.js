import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import AdminFunctions from '../../../entry/AdminFunctions';
import { ActivityContext } from '../Activity';

export default function ActivityAdminFunctions() {
  const [tc] = useTranslation('common');
  const navigate = useNavigate();
  const { activity } = useContext(ActivityContext);

  const menuItems = () => [
    {
      kind: 'edit',
      label: tc('actions.update'),
      component: null,
      onClick: () => navigate(`/activities/${activity?._id}/edit`),
    },
  ];

  return <AdminFunctions menuItems={menuItems} />;
}
