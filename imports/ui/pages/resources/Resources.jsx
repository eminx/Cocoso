import React, { useState, useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Button, Center, Heading, List, ListItem } from '@chakra-ui/react';
import { Helmet } from 'react-helmet';

import { call } from '../../@/shared';
import { message } from '../../components/message';
import { StateContext } from '../../LayoutContainer';
import Template from '../../components/Template';
import Breadcrumb from '../../components/Breadcrumb';
import ResourceCard from './components/ResourceCard';

function ResourcesPage() {
  const { currentUser, currentHost, canCreateContent } = useContext(StateContext);
  const [ resources, setResources ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(true);
  const [ tc ] = useTranslation('common');

  useEffect(() => {
    getResources();
  }, []);

  const getResources = async () => {
    try {
      const response = await call('getResources');
      setResources(response);
      setIsLoading(false);
    } catch (error) {
      message.error(error.reason);
      setIsLoading(false);
    }
  };

  return (
    <Template>
      <Helmet>
        <title>{`${tc('domains.resources')} | ${currentHost.settings.name} | ${Meteor.settings.public.name}`}</title>
      </Helmet>
      {canCreateContent && (
        <Center w="100%" mb="4">
          <Link to={currentUser ? '/resources/new' : '/my-profile'}>
            <Button
              colorScheme="green"
              variant="outline"
              textTransform="uppercase"
            >
              {tc('actions.create')}
            </Button>
          </Link>
        </Center>
      )}
      <Breadcrumb />
      {resources.length == 0 && 
        <Center>
          <Heading size="md" fontWeight="bold">
            No resource published yet.
          </Heading>
        </Center>
      }
      {!isLoading &&
        <Box p="4" mb="8">
          <List>
            {resources.map((resource, index) => (
              <ListItem key={'resource-'+index}>
                <Link to={`/resources/${resource?._id}`}>
                  <ResourceCard resource={resource}/>
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
      }
    </Template>
  );
}

export default ResourcesPage;