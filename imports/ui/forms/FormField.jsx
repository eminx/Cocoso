import React from 'react';
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/react';

function FormField({ children, errorMessage = null, helperText, label, ...otherProps }) {
  return (
    <FormControl my="4" {...otherProps}>
      <FormLabel color="gray.800" fontWeight="bold" mb="0" requiredIndicator={'*'}>
        {label}
      </FormLabel>
      {helperText && (
        <FormHelperText color="gray.600" mt="0" mb="3">
          {helperText}
        </FormHelperText>
      )}
      {children}
      {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
    </FormControl>
  );
}

export default FormField;
