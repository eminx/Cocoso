import React, { useContext } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Textarea,
  VStack,
} from '@chakra-ui/react';
import { Controller, useForm, Control, UseFormRegister } from 'react-hook-form';

import Quill from './Quill';
import FormField from './FormField';
import { luxxStyle } from '../utils/constants/theme';
import { LoaderContext } from '../listing/NewEntryHandler';

interface Option {
  value: string;
  label: string;
}

interface FormFieldItem {
  type: 'input' | 'textarea' | 'checkbox' | 'select' | 'quill' | 'number';
  value: string;
  props?: Record<string, any>;
  placeholder?: string | undefined;
  options?: Option[];
  helper?: string;
  label?: string;
}

interface FieldItemHandlerProps {
  control: Control<any>;
  item: FormFieldItem;
  register: UseFormRegister<any>;
}

interface GenericEntryFormProps {
  childrenIndex?: number;
  children?: React.ReactNode;
  defaultValues?: Record<string, any> | null;
  formFields: FormFieldItem[];
  onSubmit: () => void;
}

function FieldItemHandler({ control, item, register }: FieldItemHandlerProps) {
  const props = {
    ...register(item.value, item.props),
    placeholder: item.placeholder,
  };

  switch (item.type) {
    case 'input':
      return <Input {...props} />;
    case 'textarea':
      return (
        <Textarea
          _hover={luxxStyle.field._hover}
          _focus={luxxStyle.field._focus}
          style={luxxStyle.field}
          {...props}
        />
      );
    case 'checkbox':
      return (
        <Box bg="white" borderRadius="lg" display="inline" p="2">
          <Checkbox size="lg" {...props}>
            <FormLabel style={{ cursor: 'pointer' }} mb="0">
              {item.placeholder}
            </FormLabel>
          </Checkbox>
        </Box>
      );
    case 'select':
      return (
        <Select {...props}>
          {item.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      );
    case 'number':
      return (
        <NumberInput>
          <NumberInputField {...props} />
        </NumberInput>
      );
    case 'quill':
      return (
        <Controller
          control={control}
          name={item.value}
          render={({ field }) => <Quill {...field} />}
        />
      );
    default:
      return <Input placeholder={item.placeholder} />;
  }
}

export default function GenericEntryForm({
  childrenIndex,
  children,
  defaultValues,
  formFields,
  onSubmit,
}: GenericEntryFormProps) {
  const { control, handleSubmit, register } = useForm({
    defaultValues: defaultValues || undefined,
  });
  const { loaders } = useContext(LoaderContext);

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data))}>
      <VStack spacing="4">
        {formFields.map((item, index) => (
          <Box key={item.value} w="100%">
            {index === childrenIndex && children}
            <FormField
              helperText={item.helper}
              isRequired={item.props?.isRequired}
              label={item.label}
            >
              <FieldItemHandler control={control} item={item} register={register} />
            </FormField>
          </Box>
        ))}
      </VStack>

      <Flex justify="flex-end" my="12">
        <Button isLoading={loaders?.isCreating} type="submit">
          Submit
        </Button>
      </Flex>
    </form>
  );
}
