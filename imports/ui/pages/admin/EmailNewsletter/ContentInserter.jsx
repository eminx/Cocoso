import React, { useState, useEffect } from 'react';
import {
  Box,
  Checkbox,
  HStack,
  Image,
  Input,
  InputGroup,
  InputRightElement,
  List,
  ListItem,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Text,
} from '@chakra-ui/react';
import CloseIcon from 'lucide-react/dist/esm/icons/x-circle';
import { useTranslation } from 'react-i18next';
import moment from 'moment';

import { call, compareDatesForSortActivities, parseGroupActivities } from '../../../utils/shared';
import Loader from '../../../generic/Loader';
import { message } from '../../../generic/message';
import { ActivityDates } from './EmailPreview';
import FormField from '../../../forms/FormField';

const yesterday = moment(new Date()).add(-1, 'days');

const compareByDate = (a, b) => {
  const dateA = new Date(a.creationDate);
  const dateB = new Date(b.creationDate);
  return dateB - dateA;
};

export default function ContentInserter({ currentHost, onSelect }) {
  const [activities, setActivities] = useState([]);
  const [works, setWorks] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [worksLoading, setWorksLoading] = useState(false);
  const [filterWord, setFilterWord] = useState('');
  const [t] = useTranslation('admin');
  const [tc] = useTranslation('common');

  useEffect(() => {
    getActivities();
    getWorks();
  }, []);

  const isPortalHost = currentHost?.isPortalHost;
  const menu = currentHost?.settings?.menu;
  const activitiesInMenu = menu?.find((item) => item.name === 'activities');
  const worksInMenu = menu?.find((item) => item.name === 'works');

  const getActivities = async () => {
    setActivitiesLoading(true);
    try {
      if (isPortalHost) {
        const allActivities = await call('getAllPublicActivitiesFromAllHosts');
        const allActivitiesParsed = parseGroupActivities(allActivities);
        allActivitiesParsed && setActivities(allActivitiesParsed);
      } else {
        const allActivities = await call('getAllPublicActivities');
        const allActivitiesParsed = parseGroupActivities(allActivities);
        allActivitiesParsed && setActivities(allActivitiesParsed);
      }
    } catch (error) {
      message.error(error.error || error.reason);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const getWorks = async () => {
    setWorksLoading(true);
    try {
      if (isPortalHost) {
        const respond = await call('getAllWorksFromAllHosts');
        respond && setWorks(respond.sort(compareByDate));
      } else {
        const respond = await call('getAllWorks');
        respond && setWorks(respond.sort(compareByDate));
      }
    } catch (error) {
      message.error(error.error || error.reason);
    } finally {
      setWorksLoading(false);
    }
  };

  const getActivitiesFiltered = () => {
    if (!activities) {
      return null;
    }
    const lowerCaseFilterWord = filterWord === '' ? '' : filterWord.toLowerCase();
    const filtered = activities.filter((activity) => {
      const activityWordFiltered =
        activity?.title?.toLowerCase().indexOf(lowerCaseFilterWord) !== -1 ||
        activity?.subTitle?.toLowerCase().indexOf(lowerCaseFilterWord) !== -1;

      return (
        activity.datesAndTimes.some((date) => moment(date.endDate).isAfter(yesterday)) &&
        activityWordFiltered
      );
    });

    const pastDatesRemoved = filtered.map((activity) => {
      const datesAndTimes = activity.datesAndTimes.filter((date) =>
        moment(date.endDate).isAfter(yesterday)
      );
      return {
        ...activity,
        datesAndTimes,
      };
    });

    return pastDatesRemoved.sort(compareDatesForSortActivities);
  };

  const getWorksFiltered = () => {
    if (!works) {
      return null;
    }
    const lowerCaseFilterWord = filterWord === '' ? '' : filterWord.toLowerCase();
    return works.filter((work) => {
      const workWordFiltered =
        work?.title?.toLowerCase().indexOf(lowerCaseFilterWord) !== -1 ||
        work?.shortDescription?.toLowerCase().indexOf(lowerCaseFilterWord) !== -1;

      return workWordFiltered;
    });
  };

  const handleSelectItem = (item, type) => {
    if (type === 'activities') {
      const newActivities = activities.map((activity) => {
        if (activity._id === item._id) {
          activity.isSelected = !Boolean(activity.isSelected);
        }
        return activity;
      });
      setActivities(newActivities);
      onSelect({
        activities: newActivities.filter((a) => a.isSelected).sort(compareDatesForSortActivities),
        works: works.filter((w) => w.isSelected),
      });
    } else {
      const newWorks = works.map((work) => {
        if (work._id === item._id) {
          work.isSelected = !Boolean(work.isSelected);
        }
        return work;
      });
      setWorks(newWorks);
      onSelect({
        activities: activities.filter((a) => a.isSelected),
        works: newWorks.filter((w) => w.isSelected),
      });
    }
  };

  const activitiesFiltered = activitiesInMenu?.isVisible && getActivitiesFiltered();
  const worksFiltered = worksInMenu?.isVisible && getWorksFiltered();

  if (!activitiesInMenu?.isVisible && !worksInMenu?.isVisible) {
    return null;
  }

  return (
    <>
      <FormField label={t('newsletter.labels.insertcontent')} mt="4" mb="4">
        <Text color="gray.600" fontSize="sm">
          {t('newsletter.contenthelper')}
        </Text>
        <Tabs mt="4" onChange={() => setFilterWord('')}>
          <TabList>
            {activitiesInMenu?.isVisible && (
              <Tab px="0" mr="4">
                <Text>{activitiesInMenu?.label}</Text>
              </Tab>
            )}
            {worksInMenu?.isVisible && (
              <Tab px="0">
                <Text>{worksInMenu?.label}</Text>
              </Tab>
            )}
          </TabList>

          <InputGroup mt="2" size="sm" w="240px">
            <Input
              placeholder={tc('labels.filter')}
              value={filterWord}
              onChange={(event) => setFilterWord(event.target.value)}
            />
            {filterWord !== '' && (
              <InputRightElement>
                <CloseIcon cursor="pointer" fontSize="2xs" onClick={() => setFilterWord('')} />
              </InputRightElement>
            )}
          </InputGroup>

          <Box maxH="800px" overflowY="scroll">
            <TabPanels>
              {activitiesInMenu?.isVisible && (
                <TabPanel px="0">
                  {!activitiesLoading ? (
                    <List bg="white">
                      {activitiesFiltered?.map((activity) => (
                        <ListItem
                          key={activity._id}
                          _hover={{
                            bg: activity.isSelected ? 'green.200' : 'green.50',
                            cursor: 'pointer',
                          }}
                          bg={activity.isSelected ? 'green.200' : 'transparent'}
                          borderBottom="1px solid #eee"
                          px="2"
                          py="4"
                          onClick={() => handleSelectItem(activity, 'activities')}
                        >
                          <Checkbox
                            colorScheme="green"
                            isChecked={Boolean(activity.isSelected)}
                            size="lg"
                            onChange={(e) => handleSelectItem(activity, 'activities')}
                          >
                            <HStack alignItems="flex-start">
                              <Image
                                bg="brand.100"
                                fit="cover"
                                h="80px"
                                src={(activity.images && activity.images[0]) || activity.imageUrl}
                                w="80px"
                              />
                              <Box ml="2">
                                <Text fontSize="md" fontWeight="bold">
                                  {activity.title}
                                </Text>
                                <ActivityDates activity={activity} />
                              </Box>
                            </HStack>
                          </Checkbox>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Loader />
                  )}
                </TabPanel>
              )}

              {worksInMenu?.isVisible && (
                <TabPanel px="0">
                  {!worksLoading ? (
                    <List bg="white">
                      {worksFiltered?.map((work) => (
                        <ListItem
                          key={work._id}
                          _hover={{
                            bg: work.isSelected ? 'green.200' : 'green.50',
                            cursor: 'pointer',
                          }}
                          bg={work.isSelected ? 'green.200' : 'transparent'}
                          borderBottom="1px solid #eee"
                          px="2"
                          py="4"
                          onClick={() => handleSelectItem(work, 'works')}
                        >
                          <Checkbox
                            colorScheme="green"
                            isChecked={Boolean(work.isSelected)}
                            size="lg"
                            onChange={(e) => handleSelectItem(work, 'works')}
                          >
                            <HStack alignItems="flex-start">
                              <Image
                                bg="brand.100"
                                fit="cover"
                                h="80px"
                                src={work.images && work.images[0]}
                                w="80px"
                              />
                              <Box ml="2">
                                <Text fontSize="md" fontWeight="bold">
                                  {work.title}
                                </Text>
                                <Text fontSize="sm">{work.shortDescription}</Text>
                              </Box>
                            </HStack>
                          </Checkbox>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Loader />
                  )}
                </TabPanel>
              )}
            </TabPanels>
          </Box>
        </Tabs>
      </FormField>
    </>
  );
}
