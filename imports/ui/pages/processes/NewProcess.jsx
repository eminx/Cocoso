import React from 'react';
import { Redirect } from 'react-router-dom';
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  Popover,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Switch,
  Text,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

import ProcessForm from '../../components/ProcessForm';
import { call, resizeImage, uploadImage } from '../../utils/shared';
import Loader from '../../components/Loader';
import Template from '../../components/Template';
import { message, Alert } from '../../components/message';
import { StateContext } from '../../LayoutContainer';

class NewProcess extends React.Component {
  state = {
    formValues: {
      title: '',
      readingMaterial: '',
      description: '',
      capacity: 12,
    },
    isLoading: false,
    isSuccess: false,
    isError: false,
    isPrivate: false,
    newProcessId: null,
    uploadedImage: null,
    uploadableImage: null,
    uploadableImageLocal: null,
    isCreating: false,
  };

  setUploadableImage = (files) => {
    if (files.length > 1) {
      message.error('Please drop only one file at a time.');
      return;
    }
    const uploadableImage = files[0];
    const reader = new FileReader();
    reader.readAsDataURL(uploadableImage);
    reader.addEventListener(
      'load',
      () => {
        this.setState({
          uploadableImage,
          uploadableImageLocal: reader.result,
        });
      },
      false
    );
  };

  successCreation = () => {
    message.success('Your process is successfully created');
  };

  handleFormChange = (value) => {
    const { formValues } = this.state;
    let capacity = parseInt(value.capacity) || 2;
    if (capacity > 30) {
      capacity = 30;
    }

    const newFormValues = {
      ...value,
      capacity,
      description: formValues.description,
    };

    this.setState({
      formValues: newFormValues,
    });
  };

  handleQuillChange = (description) => {
    const { formValues } = this.state;
    const newFormValues = {
      ...formValues,
      description,
    };

    this.setState({
      formValues: newFormValues,
    });
  };

  handleSubmit = (values) => {
    const { tc } = this.props;
    const { uploadableImage } = this.state;
    if (!uploadableImage) {
      message.error(tc('message.error.imageRequired'));
      return;
    }
    const parsedValues = {
      ...values,
      capacity: Number(values.capacity),
    };
    this.setState(
      {
        isCreating: true,
        formValues: parsedValues,
      },
      this.uploadImage
    );
  };

  uploadImage = async () => {
    const { uploadableImage } = this.state;
    try {
      const resizedImage = await resizeImage(uploadableImage, 1200);
      const uploadedImage = await uploadImage(resizedImage, 'processImageUpload');
      this.setState(
        {
          uploadedImage,
        },
        () => this.createProcess()
      );
    } catch (error) {
      message.error(error.reason);
      this.setState({
        isCreating: false,
      });
      throw new Error(`Error uploading: ${error}`);
    }
  };

  createProcess = async () => {
    const { formValues, uploadedImage, isPrivate } = this.state;

    try {
      const response = await call('createProcess', formValues, uploadedImage, isPrivate);
      this.setState({
        isCreating: false,
        newProcessId: response,
        isSuccess: true,
      });
    } catch (error) {
      message.error(error.error);
      this.setState({
        isCreating: false,
        isError: true,
      });
    }
  };

  handlePrivateProcessSwitch = () => {
    const { isPrivate } = this.state;
    this.setState({
      isPrivate: !isPrivate,
    });
  };

  render() {
    const { currentUser, t, tc } = this.props;
    const { canCreateContent } = this.context;

    if (!currentUser || !canCreateContent) {
      return (
        <div style={{ maxWidth: 600, margin: '24px auto' }}>
          <Alert
            message={tc('message.access.contributor', {
              domain: `${tc('domains.a')} ${tc('domains.process').toLowerCase()}`,
            })}
            type="error"
          />
        </div>
      );
    }

    const { formValues, isLoading, isSuccess, newProcessId, uploadableImageLocal, isPrivate } =
      this.state;

    if (isLoading) {
      return <Loader />;
    }

    if (isSuccess) {
      this.successCreation();
      return <Redirect to={`/process/${newProcessId}`} />;
    }

    // const buttonLabel = isCreating ? t('form.waiting') : t('form.submit');
    const { title, description } = formValues;
    const isFormValid =
      formValues && title.length > 3 && description.length > 10 && uploadableImageLocal;

    return (
      <Template
        heading={tc('labels.create', {
          domain: tc('domains.process').toLowerCase(),
        })}
      >
        <Box bg="white" p="6">
          <Popover trigger="hover">
            <PopoverTrigger>
              <FormControl alignItems="center" display="flex" w="auto" mb="4">
                <Switch
                  isChecked={isPrivate}
                  size="lg"
                  onChange={this.handlePrivateProcessSwitch}
                />
                <FormLabel htmlFor="email-alerts" ml="2" mb="0">
                  <Flex align="center">
                    <Text fontWeight="bold">{t('form.private.label')}</Text>
                    <InfoIcon ml="2" />
                  </Flex>
                </FormLabel>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverCloseButton />
              <PopoverHeader fontWeight="bold">{t('form.private.tooltip.title')}</PopoverHeader>
              <PopoverBody>
                <Text fontSize="md" mb="2">
                  {t('form.private.tooltip.P1')}
                </Text>
                <Text fontSize="md">{t('form.private.tooltip.P2')}</Text>
              </PopoverBody>
            </PopoverContent>
          </Popover>

          <ProcessForm
            defaultValues={formValues}
            isSubmitDisabled={isFormValid}
            onSubmit={this.handleSubmit}
            setUploadableImage={this.setUploadableImage}
            uploadableImageLocal={uploadableImageLocal}
          />
        </Box>
      </Template>
    );
  }
}

NewProcess.contextType = StateContext;

export default NewProcess;
