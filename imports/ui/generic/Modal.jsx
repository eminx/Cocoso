import React from 'react';
import {
  Button,
  Modal as CModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';

function Modal({
  actionButtonLabel,
  actionButtonProps,
  h = '80%',
  isCentered = true,
  isOpen,
  scrollBehavior = 'inside',
  secondaryButtonLabel,
  title,
  onClose,
  onActionButtonClick,
  onSecondaryButtonClick,
  children,
  ...otherProps
}) {
  const modalProps = { isCentered, isOpen, scrollBehavior, onClose };

  return (
    <CModal {...modalProps} {...otherProps}>
      <ModalOverlay />
      <ModalContent borderRadius="8px" h={h}>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton onClick={onClose} />
        <ModalBody>{children}</ModalBody>

        <ModalFooter>
          {secondaryButtonLabel && (
            <Button mr={3} variant="ghost" onClick={onSecondaryButtonClick || onClose}>
              {secondaryButtonLabel}
            </Button>
          )}
          {actionButtonLabel && (
            <Button onClick={onActionButtonClick} {...actionButtonProps}>
              {actionButtonLabel}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </CModal>
  );
}

export default Modal;
