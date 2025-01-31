import React from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import Works from '../../../api/works/work';
import Hosts from '../../../api/hosts/host';
import Content from '../../entry/EntrySSR';

function Work() {
  const { workId } = useParams();
  Meteor.subscribe('work', workId);
  const work = Works.findOne(workId);
  Meteor.subscribe('host', work.host);
  const host = Hosts.findOne({ host: work.host });

  return (
    <>
      <Helmet>
        <title>{work.title}</title>
      </Helmet>
      <Content
        description={work.longDescription}
        host={host}
        imageUrl={work.images && work.images[0]}
        subTitle={work.shortDescription}
        title={work.title}
      />
    </>
  );
}

export default Work;
