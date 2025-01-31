import React, { PureComponent } from 'react';
import { Navigate } from 'react-router-dom';
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
import InfoIcon from 'lucide-react/dist/esm/icons/info';

import GroupForm from '../../generic/GroupForm';
import { call, resizeImage, uploadImage } from '../../utils/shared';
import Loader from '../../generic/Loader';
import Template from '../../layout/Template';
import { message, Alert } from '../../generic/message';
import { StateContext } from '../../LayoutContainer';
import FormTitle from '../../forms/FormTitle';

class NewGroup extends PureComponent {
  state = {
    formValues: {
      title: '',
      readingMaterial: '',
      description: '',
      capacity: 12,
    },
    isLoading: false,
    isCreating: false,
    isSuccess: false,
    isError: false,
    isPrivate: false,
    newGroupId: null,
    uploadedImage: null,
    uploadableImage: null,
    uploadableImageLocal: null,
    isCreating: false,
  };

  successCreation = () => {
    message.success('Your group is successfully created');
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
    this.setState({
      isCreating: true,
    });
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
        formValues: parsedValues,
      },
      this.uploadImage
    );
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

  uploadImage = async () => {
    const { uploadableImage } = this.state;
    try {
      const resizedImage = await resizeImage(uploadableImage, 1200);
      const uploadedImage = await uploadImage(resizedImage, 'groupImageUpload');
      this.setState(
        {
          uploadedImage,
        },
        () => this.createGroup()
      );
    } catch (error) {
      console.error('Error uploading:', error);
      message.error(error.reason);
      this.setState({
        isCreating: false,
      });
    }
  };

  createGroup = async () => {
    const { formValues, uploadedImage, isPrivate } = this.state;

    try {
      const response = await call('createGroup', formValues, uploadedImage, isPrivate);
      this.setState({
        newGroupId: response,
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

  handlePrivateGroupSwitch = () => {
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
              domain: `${tc('domains.a')} ${tc('domains.group').toLowerCase()}`,
            })}
            type="error"
          />
        </div>
      );
    }

    const {
      formValues,
      isLoading,
      isSuccess,
      newGroupId,
      uploadableImageLocal,
      isPrivate,
      isCreating,
    } = this.state;

    if (isLoading) {
      return <Loader />;
    }

    if (isSuccess) {
      this.successCreation();
      return <Navigate to={`/groups/${newGroupId}`} />;
    }

    const { title, description } = formValues;
    const isFormValid =
      formValues && title.length > 3 && description.length > 10 && uploadableImageLocal;

    return (
      <Box>
        <FormTitle context="groups" isNew />
        <Template>
          <Box mb="8">
            <Popover trigger="hover">
              <PopoverTrigger>
                <FormControl alignItems="center" display="flex" w="auto" mb="4">
                  <Switch
                    isChecked={isPrivate}
                    size="lg"
                    onChange={this.handlePrivateGroupSwitch}
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

            <GroupForm
              defaultValues={formValues}
              isSubmitDisabled={isFormValid}
              isButtonLoading={isCreating}
              onSubmit={this.handleSubmit}
              setUploadableImage={this.setUploadableImage}
              uploadableImageLocal={uploadableImageLocal}
            />
          </Box>
        </Template>
      </Box>
    );
  }
}

NewGroup.contextType = StateContext;

export default NewGroup;
