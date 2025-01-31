import { Meteor } from 'meteor/meteor';
import { getHost } from '../_utils/shared';
import { isContributorOrAdmin } from '../users/user.roles';
import Hosts from '../hosts/host';
import Groups from '../groups/group';
import Chats from './chat';

Meteor.methods({
  getChatByContextId(contextId) {
    const chat = Chats.findOne({ contextId });
    return chat;
  },

  createChat(contextName, contextId, contextType) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isContributorOrAdmin(user, currentHost)) {
      throw new Meteor.Error('Not allowed!');
    }

    const theChat = Chats.insert({
      host,
      contextId,
      contextName,
      contextType,
      createdBy: {
        userId: user._id,
        username: user.username,
      },
      isNotificationOn: false,
      messages: [],
    });
    return theChat;
  },

  addChatMessage(values) {
    const user = Meteor.user();
    if (!user) {
      throw new Meteor.Error('Not allowed!');
    }
    const host = getHost(this);

    try {
      Chats.update(
        { contextId: values.contextId },
        {
          $push: {
            messages: {
              content: values.message,
              host,
              senderUsername: user.username,
              senderAvatar: user.avatar?.src,
              senderId: user._id,
              createdDate: new Date(),
            },
          },
          $set: {
            isNotificationOn: true,
            lastMessageBy: user._id,
          },
        }
      );
      if (values.context === 'groups') {
        const unSeenIndex = Chats.findOne({ contextId: values.contextId })?.messages?.length - 1;
        Meteor.call('createGroupNotification', host, values, unSeenIndex);
      }
    } catch (error) {
      throw new Meteor.Error(error);
    }
  },

  createGroupNotification(host, values, unSeenIndex) {
    const user = Meteor.user();
    if (!user) {
      throw new Meteor.Error('Not allowed!');
    }

    const contextId = values.contextId;

    try {
      const theGroup = Groups.findOne(contextId);
      const theOthers = theGroup.members
        .filter((member) => member.memberId !== user._id)
        .map((other) => Meteor.users.findOne(other.memberId));
      theOthers.forEach((member) => {
        let contextIdIndex = -1;
        for (let i = 0; i < member.notifications.length; i += 1) {
          if (member.notifications[i].contextId === contextId) {
            contextIdIndex = i;
            break;
          }
        }

        if (contextIdIndex !== -1) {
          const notifications = [...member.notifications];
          notifications[contextIdIndex].count += 1;
          if (!notifications[contextIdIndex].unSeenIndexes) {
            notifications[contextIdIndex].unSeenIndexes = [];
          }

          notifications[contextIdIndex].unSeenIndexes?.push(unSeenIndex);
          Meteor.users.update(member._id, {
            $set: {
              notifications,
            },
          });
        } else {
          Meteor.users.update(member._id, {
            $push: {
              notifications: {
                title: theGroup.title,
                count: 1,
                context: 'groups',
                contextId: theGroup._id,
                host,
                unSeenIndexes: [unSeenIndex],
              },
            },
          });
        }
      });
    } catch (error) {
      console.log('error', error);
      throw new Meteor.Error(error);
    }
  },

  removeNotification(contextId, messageIndex) {
    const user = Meteor.user();
    if (!user) {
      throw new Meteor.Error('Not allowed!');
    }

    try {
      const notifications = [...user.notifications];
      if (!notifications) {
        return;
      }

      const notificationIndex = notifications.findIndex(
        (notification) => notification.contextId === contextId
      );

      if (notificationIndex < 0) {
        return;
      }

      notifications[notificationIndex].count -= 1;

      let newNotifications;
      if (notifications[notificationIndex].count === 0) {
        newNotifications = notifications.filter(
          (notification, index) => index !== notificationIndex
        );
      } else {
        const newUnSeenIndexes = notifications[notificationIndex].unSeenIndexes.filter(
          (unSeenIndex) => unSeenIndex !== messageIndex
        );
        notifications[notificationIndex].unSeenIndexes = newUnSeenIndexes;
        newNotifications = notifications;
      }

      Meteor.users.update(user._id, {
        $set: {
          notifications: newNotifications,
        },
      });
    } catch (error) {
      console.log('error', error);
      throw new Meteor.Error(error);
    }
  },
});
