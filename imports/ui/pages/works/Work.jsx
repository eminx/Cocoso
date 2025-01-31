import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { StateContext } from '../../LayoutContainer';
import Loader from '../../generic/Loader';
import { call } from '../../utils/shared';
import WorkHybrid from '../../entry/WorkHybrid';

export default function Work() {
  const initialWork = window?.__PRELOADED_STATE__?.work || null;
  const initialDocuments = window?.__PRELOADED_STATE__?.documents || [];
  const Host = window?.__PRELOADED_STATE__?.Host || null;

  const [work, setWork] = useState(initialWork);
  const [documents, setDocuments] = useState(initialDocuments);

  let { currentHost } = useContext(StateContext);
  const { usernameSlug, workId } = useParams();
  const [, username] = usernameSlug.split('@');

  if (!currentHost) {
    currentHost = Host;
  }

  const getData = async () => {
    try {
      const response = await call('getWork', workId, username);
      setWork(response);
      const docs = await call('getDocumentsByAttachments', response._id);
      setDocuments(docs);
    } catch (error) {
      // message.error(error.reason);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  if (!work) {
    return <Loader />;
  }

  return <WorkHybrid documents={documents} work={work} Host={currentHost} />;
}
