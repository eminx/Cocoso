import React, { PureComponent } from 'react';
import { Redirect } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

import PageForm from '../../components/PageForm';
import Template from '../../components/Template';
import { message, Alert } from '../../components/message';
import { parseTitle, call } from '../../utils/shared';
import { StateContext } from '../../LayoutContainer';

class NewPage extends PureComponent {
  state = {
    formValues: {
      title: '',
      longDescription: '',
    },
    isSuccess: false,
    isError: false,
    newPageId: null,
  };

  handleSubmit = async (values) => {
    const { currentUser, pageTitles, tc } = this.props;
    const { role } = this.context;

    if (!currentUser || role !== 'admin') {
      message.error(tc('message.access.deny'));
      return false;
    }

    if (
      pageTitles &&
      values &&
      pageTitles.some((title) => title.toLowerCase() === values.title.toLowerCase())
    ) {
      message.error(
        tc('message.exists', {
          domain: tc('domains.page').toLowerCase(),
          property: tc('domains.props.title'),
        })
      );
      return null;
    }

    try {
      const result = await call('createPage', values);
      message.success(
        tc('message.success.create', {
          domain: `${tc('domains.your')} ${tc('domains.page').toLowerCase()}`,
        })
      );
      this.setState({
        newPageId: parseTitle(result),
        isSuccess: true,
      });
    } catch (error) {
      this.setState({
        isError: true,
      });
      throw new Error(`error: ${error}`);
    }
    return null;
  };

  validateTitle = (rule, value, callback) => {
    const { pageData, pageTitles, tc } = this.props;

    let pageExists = false;
    if (
      pageTitles &&
      value &&
      pageTitles.some((title) => title.toLowerCase() === value.toLowerCase()) &&
      pageData.title.toLowerCase() !== value.toLowerCase()
    ) {
      pageExists = true;
    }

    if (pageExists) {
      callback(
        tc('message.exists', {
          domain: tc('domains.page').toLowerCase(),
          property: tc('domains.props.title'),
        })
      );
    } else if (value.length < 4) {
      callback(tc('message.validation.min', { field: 'Page title', min: '4' }));
    } else {
      callback();
    }
  };

  render() {
    const { currentUser, tc } = this.props;
    const { role } = this.context;

    if (!currentUser || role !== 'admin') {
      return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <Alert
            message={tc('message.access.admin', {
              domain: `${tc('domains.static')} ${tc('domains.page').toLowerCase()}`,
            })}
            type="error"
          />
        </div>
      );
    }

    const { formValues, isSuccess, newPageId } = this.state;

    if (isSuccess && newPageId) {
      return <Redirect to={`/page/${newPageId}`} />;
    }

    return (
      <Template heading={tc('labels.create', { domain: tc('domains.page') })}>
        <Box bg="white" p="6">
          <PageForm defaultValues={formValues} onSubmit={this.handleSubmit} />
        </Box>
      </Template>
    );
  }
}

NewPage.contextType = StateContext;

export default NewPage;
