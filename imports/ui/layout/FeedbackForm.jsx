import React, { useState } from 'react';
import {
  Button,
  Center,
  Flex,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
  VStack,
} from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';

import FormField from '../forms/FormField';

function FeedbackForm({ isDarkText = true }) {
  const [tc] = useTranslation('common');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  return (
    <>
      <Center p="2">
        <Button
          color={isDarkText ? 'brand.500' : 'brand.50'}
          size="xs"
          variant="link"
          onClick={() => setShowFeedbackModal(true)}
        >
          {tc('modals.feedback.label')}
        </Button>
      </Center>

      <Modal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)}>
        <ModalOverlay />
        <ModalContent bg="brand.50">
          <ModalHeader>{tc('modals.feedback.label')}</ModalHeader>
          <ModalCloseButton />
          <form action="https://formspree.io/f/xdopweon" method="POST">
            <ModalBody>
              <VStack spacing="6">
                <FormField label={tc('modals.feedback.form.email.label')}>
                  <Input type="email" name="_replyto" />
                </FormField>

                <FormField label={tc('modals.feedback.form.subject.label')}>
                  <Select name="subject">
                    {[
                      tc('modals.feedback.form.subject.select.suggest'),
                      tc('modals.feedback.form.subject.select.bug'),
                      tc('modals.feedback.form.subject.select.compliment'),
                    ].map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField label={tc('modals.feedback.form.details.label')}>
                  <Textarea name="message" />
                </FormField>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={() => setShowFeedbackModal(false)}>
                {tc('actions.close')}
              </Button>
              <Button colorScheme="blue" type="submit">
                {tc('actions.send')}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
}

export default FeedbackForm;
