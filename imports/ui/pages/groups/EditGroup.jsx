import React, { PureComponent } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, Button, Center } from '@chakra-ui/react';

import { call, resizeImage, uploadImage } from '../../utils/shared';
import GroupForm from '../../generic/GroupForm';
import Template from '../../layout/Template';
import Loader from '../../generic/Loader';
import ConfirmModal from '../../generic/ConfirmModal';
import { message, Alert } from '../../generic/message';
import FormTitle from '../../forms/FormTitle';

class EditGroup extends PureComponent {
  state = {
    formValues: {
      title: '',
      readingMaterial: '',
      description: '',
      capacity: 12,
    },
    isDeleteModalOn: false,
    isSuccess: false,
    isUpdating: false,
    uploadedImage: null,
    uploadableImage: null,
    uploadableImageLocal: null,
  };

  handleSubmit = (values) => {
    this.setState({
      isUpdating: true,
    });
    const { uploadableImage } = this.state;

    const parsedValues = {
      ...values,
      capacity: Number(values.capacity),
    };

    this.setState(
      {
        isUpdating: true,
        formValues: parsedValues,
      },
      () => {
        if (uploadableImage) {
          this.uploadImage();
        } else {
          this.updateGroup();
        }
      }
    );
  };

  setUploadableImage = (files) => {
    const { tc } = this.props;
    if (files.length > 1) {
      message.error(tc('plugins.fileDroppper.single'));
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
        () => this.updateGroup()
      );
    } catch (error) {
      console.error('Error uploading:', error);
      message.error(error.reason);
      this.setState({
        isCreating: false,
      });
    }
  };

  updateGroup = async () => {
    const { group, tc } = this.props;
    const { formValues, uploadedImage } = this.state;
    const imageUrl = uploadedImage || group.imageUrl;

    try {
      await call('updateGroup', group._id, formValues, imageUrl);
      message.success(tc('message.success.update'));
      this.setState({
        isSuccess: true,
      });
    } catch (error) {
      console.log(error);
      message.error(error.error || error.reason);
    }
  };

  hideDeleteModal = () => this.setState({ isDeleteModalOn: false });
  showDeleteModal = () => this.setState({ isDeleteModalOn: true });

  deleteGroup = async () => {
    const { group, tc } = this.props;
    const groupId = group._id;

    try {
      await call('deleteGroup', groupId);
      message.success(tc('message.success.remove'));
      this.setState({ isSuccess: true });
    } catch (error) {
      console.log(error);
      message.error(error.error || error.reason);
    }
  };

  render() {
    const { group, currentUser, tc } = this.props;

    if (!group) {
      return <Loader />;
    }

    if (!currentUser) {
      return (
        <Alert
          message={tc('message.access.register', {
            domain: `${tc('domains.a')} ${tc('domains.group').toLowerCase()}`,
          })}
        />
      );
    }

    if (!group.members.some((member) => member.memberId === currentUser._id && member.isAdmin)) {
      return <Alert message="You are not allowed!" />;
    }

    const { isDeleteModalOn, formValues, isSuccess, uploadableImageLocal, isUpdating } = this.state;

    if (isSuccess) {
      if (isDeleteModalOn) {
        return <Navigate to="/groups" />;
      }
      return <Navigate to={`/groups/${group._id}/info`} />;
    }

    return (
      <Box>
        <FormTitle context="groups" />
        <Template>
          <Box>
            <GroupForm
              defaultValues={group}
              imageUrl={group && group.imageUrl}
              isButtonLoading={isUpdating}
              onSubmit={this.handleSubmit}
              setUploadableImage={this.setUploadableImage}
              uploadableImageLocal={uploadableImageLocal}
            />
          </Box>

          <Center p="4">
            <Button colorScheme="red" size="sm" variant="ghost" onClick={this.showDeleteModal}>
              {tc('actions.remove')}
            </Button>
          </Center>

          <ConfirmModal
            visible={isDeleteModalOn}
            title={tc('modals.confirm.delete.title')}
            onConfirm={this.deleteGroup}
            onCancel={this.hideDeleteModal}
            confirmText={tc('modals.confirm.delete.yes')}
          >
            {tc('modals.confirm.delete.body', {
              domain: tc('domains.group').toLowerCase(),
            })}
          </ConfirmModal>
        </Template>
      </Box>
    );
  }
}

export default EditGroup;
