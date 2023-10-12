import React from 'react';
import { FormControl, FormLabel, FormErrorMessage, FormHelperText } from '@chakra-ui/react';

function FormField({ children, errorMessage, helperText, label, size = 'sm', ...otherProps }) {
  return (
    <FormControl {...otherProps}>
      <FormLabel mb="1" requiredIndicator={'*'}>
        {label}
      </FormLabel>
      {children}
      {helperText && <FormHelperText color="#585858">{helperText}</FormHelperText>}
      {errorMessage && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
    </FormControl>
  );
}

export default FormField;
