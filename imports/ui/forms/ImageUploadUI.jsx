import React from 'react';
import { Box, Center, IconButton, Wrap } from '@chakra-ui/react';
import { sortableContainer, sortableElement } from 'react-sortable-hoc';
import SmallCloseIcon from 'lucide-react/dist/esm/icons/x-circle';

import FileDropper from './FileDropper';

function ImageUploader({ images = [], onRemoveImage, onSortImages, onSelectImages }) {
  return (
    <Box>
      {images && images.length > 0 ? (
        <SortableContainer onSortEnd={onSortImages} axis="xy" helperClass="sortableHelper">
          {images.map((image, index) => (
            <SortableItem
              key={image}
              index={index}
              image={image}
              onRemoveImage={() => onRemoveImage(index)}
            />
          ))}
          <FileDropper setUploadableImage={onSelectImages} isMultiple />
        </SortableContainer>
      ) : (
        <Center>
          <FileDropper setUploadableImage={onSelectImages} isMultiple />
        </Center>
      )}
    </Box>
  );
}

const thumbStyle = (backgroundImage) => ({
  backgroundImage: backgroundImage && `url('${backgroundImage}')`,
});

const SortableItem = sortableElement(({ image, onRemoveImage, index }) => (
  <Box key={image} className="sortable-thumb" style={thumbStyle(image)}>
    <IconButton
      className="sortable-thumb-icon"
      colorScheme="gray.900"
      icon={<SmallCloseIcon style={{ pointerEvents: 'none' }} />}
      size="xs"
      onClick={onRemoveImage}
      style={{ position: 'absolute', top: 4, right: 4 }}
    />
  </Box>
));

const SortableContainer = sortableContainer(({ children }) => (
  <Center w="100%">
    <Wrap py="2" display="flex" justify="center">
      {children}
    </Wrap>
  </Center>
));

export default ImageUploader;
