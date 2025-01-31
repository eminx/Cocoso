import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import i18next from 'i18next';
import { message } from '../../generic/message';
import { call } from '../../utils/shared';

function loginWithPassword(username, password, isNewAccount) {
  Meteor.loginWithPassword(username, password, (error) => {
    if (error) {
      console.log(error);
      message.error(error.reason);
      return;
    }
    if (isNewAccount) {
      Meteor.call('setSelfAsParticipant', (error2) => {
        if (error2) {
          message.error(error2.reason);
          console.log(error2);
        }
      });
    }
    const translation = i18next.t('accounts:login.messages.success');
    message.success(translation);
  });
}

async function createAccount(values) {
  check(values.email, String);
  check(values.username, String);
  check(values.password, String);
  try {
    await call('createAccount', values);
    loginWithPassword(values.username, values.password, true);
  } catch (error) {
    message.error(error.error ? error.error.reason : error.reason);
  }
}

export { createAccount, loginWithPassword };
