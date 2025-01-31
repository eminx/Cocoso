import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Heading, Text } from '@chakra-ui/react';
import CreatableSelect from 'react-select/creatable';
import makeAnimated from 'react-select/animated';
import { useTranslation } from 'react-i18next';
import { message } from '../../generic/message';
import { call } from '../../utils/shared';

const animatedComponents = makeAnimated();

function KeywordsManager({ currentUser }) {
  const [allKeywords, setAllKeywords] = useState([]);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [creating, setCreating] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [t] = useTranslation('accounts');
  const [tc] = useTranslation('common');

  useEffect(() => {
    getKeywords();
  }, []);

  const getKeywords = async () => {
    try {
      const respond = await call('getKeywords');
      setAllKeywords(respond);
      const selfKeywords = respond.filter((k) =>
        currentUser?.keywords?.map((kw) => kw.keywordId).includes(k._id)
      );
      setSelectedKeywords(selfKeywords);
    } catch (error) {
      console.log(error);
      message.error(error.reason);
    }
  };

  const saveKeywords = async () => {
    try {
      await call('saveKeywords', selectedKeywords);
      setIsChanged(false);
      message.success(tc('message.success.update'));
    } catch (error) {
      console.log(error);
      message.error(error.reason);
    }
  };

  const createKeyword = async (keyword) => {
    setCreating(true);
    try {
      const respond = await call('createKeyword', keyword);
      message.success(tc('message.success.create'));
      setSelectedKeywords([
        ...selectedKeywords,
        {
          label: keyword,
          _id: respond,
        },
      ]);
      setAllKeywords([
        ...allKeywords,
        {
          label: keyword,
          _id: respond,
        },
      ]);
      setIsChanged(true);
      setCreating(false);
    } catch (error) {
      console.log(error);
      message.error(error.reason);
    }
  };

  const handleChange = (value) => {
    setSelectedKeywords(value);
    setIsChanged(true);
  };

  return (
    <Box>
      <Heading mb="2" size="sm" textAlign="center">
        {t('profile.menu.keywords.label')}
      </Heading>
      <Text fontSize="sm" mb="4">
        {t('profile.menu.keywords.description')}
      </Text>
      <CreatableSelect
        components={animatedComponents}
        isClearable
        isLoading={creating}
        isMulti
        options={allKeywords}
        placeholder="Type something and press enter..."
        style={{ width: '100%', marginTop: '1rem' }}
        value={selectedKeywords}
        getOptionValue={(option) => option._id}
        onChange={(newValue) => handleChange(newValue)}
        onCreateOption={(newKeyword) => createKeyword(newKeyword)}
      />

      <Flex justify="flex-end" mt="4">
        <Button isDisabled={!isChanged} onClick={() => saveKeywords()}>
          {tc('actions.submit')}
        </Button>
      </Flex>
    </Box>
  );
}

export default KeywordsManager;
