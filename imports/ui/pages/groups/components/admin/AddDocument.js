import { Meteor } from 'meteor/meteor';
import { Slingshot } from 'meteor/edgee:slingshot';
import React, { useContext, useState } from 'react';
import { Box, Center, Flex, Heading, Spinner, Text } from '@chakra-ui/react';
import ReactDropzone from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import Modal from '../../../../generic/Modal';
import { DocumentUploadHelper } from '../../../../forms/UploadHelpers';
import GroupDocuments from '../GroupDocuments';
import { GroupContext } from '../../Group';

export default function AddDocument({ onClose }) {
  const [isUploading, setIsUploading] = useState(false);
  const [tc] = useTranslation('common');
  const { group, getGroupById } = useContext(GroupContext);

  if (!group) {
    return null;
  }

  const handleFileDrop = (files) => {
    if (files.length !== 1) {
      // message.error(tc('plugins.fileDropper.single'));
      return;
    }

    const closeLoader = () => {
      getGroupById();
      setIsUploading(false);
    };

    setIsUploading(true);
    const upload = new Slingshot.Upload('groupDocumentUpload');
    const file = files[0];
    const parsedName = file.name.replace(/\s+/g, '-').toLowerCase();
    const uploadableFile = new File([file], parsedName, {
      type: file.type,
    });

    upload.send(uploadableFile, (error, downloadUrl) => {
      if (error) {
        // console.error('Error uploading:', error);
        // message.error(error.reason);
        closeLoader();
      } else {
        Meteor.call(
          'createDocument',
          uploadableFile.name,
          downloadUrl,
          'group',
          group._id,
          (error1) => {
            if (error1) {
              // console.log(error);
              return;
            }
            Meteor.call(
              'addGroupDocument',
              { name: uploadableFile.name, downloadUrl },
              group._id,
              (error2) => {
                if (error2) {
                  // console.log(error2);
                  return;
                }
                closeLoader();
              }
            );
          }
        );
      }
    });
  };

  return (
    <Modal isOpen size="lg" title={tc('documents.label')} onClose={onClose}>
      <ReactDropzone onDrop={handleFileDrop} multiple={false}>
        {({ getRootProps, getInputProps, isDragActive }) => (
          <Box
            bg={isDragActive ? 'brand.300' : 'brand.50'}
            border="1x dashed"
            borderColor="brand.300"
            borderRadius="8px"
            cursor="grab"
            h="180px"
            p="4"
            w="100%"
            {...getRootProps()}
          >
            {isUploading ? (
              <Center>
                <Flex align="center" direction="column">
                  <Spinner />
                  <Text mt="2" textTransform="capitalize">
                    {tc('documents.up')}
                  </Text>
                </Flex>
              </Center>
            ) : (
              <div style={{ textAlign: 'center' }}>{tc('documents.drop')}</div>
            )}
            <input {...getInputProps()} />
          </Box>
        )}
      </ReactDropzone>
      <DocumentUploadHelper />
      <Box pt="8">
        <Heading size="sm">{tc('documents.label')}</Heading>
        <GroupDocuments documents={group.documents} />
      </Box>
    </Modal>
  );
}
