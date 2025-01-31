import React, { useContext, useEffect, useState } from 'react';
import ReactDropzone from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import { Box, Code, Flex, Link as CLink, Text, Skeleton } from '@chakra-ui/react';
import ExternalLinkIcon from 'lucide-react/dist/esm/icons/external-link';

import { call } from '../../../utils/shared';
import { message } from '../../../generic/message';
import NiceList from '../../../generic/NiceList';
import { DocumentUploadHelper } from '../../../forms/UploadHelpers';
import { StateContext } from '../../../LayoutContainer';

export default function DocumentsField({ contextType, contextId, isAllowed = false }) {
  const [documents, setDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isDesktop } = useContext(StateContext);

  useEffect(() => {
    getDocuments();
  }, [documents.length]);

  const [tc] = useTranslation('common');

  const getDocuments = async () => {
    if (!contextId) {
      return;
    }
    try {
      const response = await call('getDocumentsByAttachments', contextId);
      setDocuments(response.reverse());
      setIsLoading(false);
    } catch (error) {
      message.error(error.reason);
      setIsLoading(false);
    }
  };

  const createDocument = async (uploadableFile, downloadUrl) => {
    try {
      await call('createDocument', uploadableFile.name, downloadUrl, contextType, contextId);
      getDocuments();
      message.success(`${uploadableFile.name} ${tc('documents.fileDropper')}`);
    } catch (error) {
      message.error(error.reason);
    } finally {
      setIsUploading(false);
    }
  };

  const removeDocument = async (documentId) => {
    if (!isAllowed) {
      message.error(tc('message.access.deny'));
      return;
    }

    try {
      await call('removeDocument', documentId);
      getDocuments();
      message.success(tc('documents.remove'));
    } catch (error) {
      message.error(error.reason);
    }
  };

  const handleFileDrop = (files) => {
    if (files.length !== 1) {
      message.error(tc('plugins.fileDropper.single'));
      return;
    }
    setIsUploading(true);
    const upload = new Slingshot.Upload('groupDocumentUpload');
    files.forEach((file) => {
      const parsedName = file.name.replace(/\s+/g, '-').toLowerCase();
      const uploadableFile = new File([file], parsedName, {
        type: file.type,
      });
      upload.send(uploadableFile, (error, downloadUrl) => {
        if (error) {
          console.error('Error uploading:', error);
          message.error(error.reason);
          setIsUploading(false);
        } else {
          createDocument(uploadableFile, downloadUrl);
        }
      });
    });
  };

  if (isLoading) {
    return <Skeleton w="100%" h="100%" startColor="brand.100" endColor="brand.200" />;
  }

  if (!documents) {
    return null;
  }

  const documentsList = documents.map((document) => ({
    ...document,
    actions: [
      {
        content: tc('labels.remove'),
        handleClick: () => removeDocument(document._id),
      },
    ],
  }));

  return (
    <Box>
      <Box mb="4" px={isDesktop ? '0' : '4'}>
        {documents && documents.length > 0 ? (
          <NiceList actionsDisabled={!isAllowed} list={documentsList}>
            {(document) => (
              <Box style={{ width: '100%' }}>
                <Code fontWeight="bold">
                  <CLink
                    color="blue.600"
                    href={document.documentUrl}
                    overflowWrap="anywhere"
                    rel="noreferrer"
                    target="_blank"
                  >
                    {document.documentLabel} <ExternalLinkIcon mr="2px" fontSize="sm" />
                  </CLink>
                </Code>
              </Box>
            )}
          </NiceList>
        ) : (
          <Text fontSize="sm" fontWeight="bold" mb="4" textAlign="center">
            {tc('documents.empty')}
          </Text>
        )}
      </Box>
      {isAllowed && (
        <Box>
          <Box mb="2">
            <ReactDropzone onDrop={handleFileDrop} multiple={false}>
              {({ getRootProps, getInputProps, isDragActive }) => (
                <Flex
                  _hover={{ bg: 'brand.50' }}
                  align="center"
                  bg={isDragActive ? 'gray.300' : 'white'}
                  border="2px dashed"
                  borderColor="brand.500"
                  cursor="grab"
                  direction="column"
                  h="120px"
                  justify="center"
                  p="4"
                  w="100%"
                  {...getRootProps()}
                >
                  {isUploading ? (
                    <Skeleton w="100%" h="100%" startColor="brand.100" endColor="brand.200" />
                  ) : (
                    <Text textAlign="center" fontSize="sm">
                      {tc('documents.drop')}
                    </Text>
                  )}
                  <input {...getInputProps()} />
                </Flex>
              )}
            </ReactDropzone>
          </Box>
          <DocumentUploadHelper />
        </Box>
      )}
    </Box>
  );
}
