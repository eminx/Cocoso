import React, { useContext } from 'react';
import { useSearchParams } from 'react-router-dom';

import PublicActivityForm from './PublicActivityForm';
import { ActivityContext } from './Activity';
import { call } from '../../utils/shared';

export default function EditPublicActivity() {
  const { activity, getActivityById } = useContext(ActivityContext);
  const [, setSearchParams] = useSearchParams();
  if (!activity) {
    return null;
  }

  const updateActivity = async (newActivity) => {
    const activityId = activity._id;
    try {
      await call('updateActivity', activityId, newActivity);
      await getActivityById(activityId);
      // message.success(t('form.success'));
      setSearchParams({ edit: 'false' });
    } catch (error) {
      console.log(error);
    }
  };

  const activityFields = (({
    address,
    capacity,
    datesAndTimes,
    images,
    isExclusiveActivity,
    isRegistrationEnabled,
    longDescription,
    place,
    resource,
    resourceId,
    subTitle,
    title,
  }) => ({
    address,
    capacity,
    datesAndTimes,
    images,
    isExclusiveActivity,
    isRegistrationEnabled,
    longDescription,
    place,
    resource,
    resourceId,
    subTitle,
    title,
  }))(activity);

  return (
    <>
      <PublicActivityForm activity={activityFields} onFinalize={updateActivity} />
    </>
  );
}
