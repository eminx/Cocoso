import React, { useState, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Box, Button, Text } from 'grommet';
import Loader from '../UIComponents/Loader';
import { call } from '../functions';

const compareByDate = (a, b) => {
  const dateA = new Date(a.creationDate);
  const dateB = new Date(b.creationDate);
  return dateB - dateA;
};

const imageStyle = {
  width: 288,
  height: 180,
  objectFit: 'cover'
};

const Market = ({ history }) => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllWorks();
  }, []);

  const getAllWorks = async () => {
    try {
      const response = await call('getAllWorks');
      setWorks(response);
      setLoading(false);
    } catch (error) {
      message.error(error.reason);
      setLoading(false);
    }
  };

  if (loading || !works) {
    return <Loader />;
  }

  const sortedWorks = works.sort(compareByDate);

  return (
    <Box width="100%" margin={{ bottom: '50px' }} pad="medium">
      <Box direction="row" wrap justify="center">
        {sortedWorks.map(work => (
          <Box
            key={work._id}
            width="medium"
            pad="medium"
            // hoverIndicator="light-1"
            onClick={() =>
              history.push(`/${work.authorUsername}/work/${work._id}`)
            }
          >
            <Box>
              <Box pad={{ bottom: 'medium' }}>
                <Text weight={600} size="large">
                  {work.title}
                </Text>
                <Text weight={300}>{work.shortDescription}</Text>
              </Box>

              <Box>
                <LazyLoadImage
                  alt={work.title}
                  src={work.images && work.images[0]}
                  style={imageStyle}
                  effect="black-and-white"
                />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Market;
