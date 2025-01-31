import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { call } from '../../utils/shared';
import { message } from '../../generic/message';
import { StateContext } from '../../LayoutContainer';
import Loader from '../../generic/Loader';
import ResourceHybrid from '../../entry/ResourceHybrid';
import ResourceInteractionHandler from './components/ResourceInteractionHandler';

export const ResourceContext = createContext(null);

export default function Resource() {
  const initialResource = window?.__PRELOADED_STATE__?.resource || null;
  const initialDocuments = window?.__PRELOADED_STATE__?.documents || [];
  const Host = window?.__PRELOADED_STATE__?.Host || null;

  const [resource, setResource] = useState(initialResource);
  const [documents, setDocuments] = useState(initialDocuments);
  const [rendered, setRendered] = useState(false);
  const { resourceId } = useParams();
  let { currentHost } = useContext(StateContext);

  if (!currentHost) {
    currentHost = Host;
  }

  useLayoutEffect(() => {
    setTimeout(() => {
      setRendered(true);
    }, 1000);
  }, []);

  const getResourceById = async () => {
    try {
      const response = await call('getResourceById', resourceId);
      setResource(response);
      const docs = await call('getDocumentsByAttachments', response._id);
      setDocuments(docs);
    } catch (error) {
      message.error(error.reason);
    }
  };

  useEffect(() => {
    getResourceById();
  }, []);

  if (!resource) {
    return <Loader />;
  }

  const contextValue = {
    resource,
    getResourceById,
  };

  return (
    <>
      <ResourceHybrid documents={documents} resource={resource} Host={currentHost} />
      {rendered && (
        <ResourceContext.Provider value={contextValue}>
          <ResourceInteractionHandler slideStart={rendered} />
        </ResourceContext.Provider>
      )}
    </>
  );
}
