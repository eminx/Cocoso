import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { useTranslation } from 'react-i18next';

import EditProcess from './EditProcess';
import Processes from '../../../api/processes/process';

const EditProcessContainer = withTracker((props) => {
  const processId = props.match.params.id;
  const processSubscription = Meteor.subscribe('process', processId);
  const isLoading = !processSubscription.ready();
  const process = Processes ? Processes.findOne({ _id: processId }) : null;
  const currentUser = Meteor.user();

  const [t] = useTranslation('processes');
  const [tc] = useTranslation('common');

  return {
    isLoading,
    process,
    currentUser,
    t,
    tc,
  };
})(EditProcess);

export default EditProcessContainer;
