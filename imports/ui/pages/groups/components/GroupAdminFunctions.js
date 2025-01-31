import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AddDocument from './admin/AddDocument';
import AddMeeting from './admin/AddMeeting';
import ManageMembers from './admin/ManageMembers';
import AdminFunctions from '../../../entry/AdminFunctions';

export default function GroupAdminFunctions() {
  const [popup, setPopup] = useState('none');
  const [t] = useTranslation('groups');

  const handleSelect = (item) => {
    setPopup(item.kind);
  };

  const handleClose = () => {
    setPopup('none');
  };

  const menuItems = [
    {
      kind: 'document',
      label: t('admin.add_document'),
    },
    {
      kind: 'meeting',
      label: t('admin.add_meeting'),
    },
    {
      kind: 'members',
      label: t('admin.manage_members'),
    },
  ];

  return (
    <>
      <AdminFunctions menuItems={menuItems} onSelect={handleSelect} />

      {popup === 'document' ? <AddDocument onClose={handleClose} /> : null}
      {popup === 'meeting' ? <AddMeeting onClose={handleClose} /> : null}
      {popup === 'members' ? <ManageMembers onClose={handleClose} /> : null}
    </>
  );
}
