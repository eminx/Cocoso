import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

import { getHost } from '../_utils/shared';
import { isAdmin, isContributorOrAdmin, isMember } from '../users/user.roles';
import Hosts from '../hosts/host';
import Groups from './group';
import Activities from '../activities/activity';
import Platform from '../platform/platform';
import { getGroupRegistrationEmailBody, getInviteToPrivateGroupEmailBody } from './group.mails';
import { parseGroupsWithMeetings } from '../../ui/utils/shared';

const publicSettings = Meteor.settings.public;

const isUserGroupAdmin = (group, userId) => {
  if (!group || !userId) {
    return false;
  }
  return group.members.some((member) => member.memberId === userId && member.isAdmin);
};

Meteor.methods({
  getGroup(groupId) {
    check(groupId, String);
    const group = Groups.findOne({
      _id: groupId,
    });
    if (!group) {
      throw new Meteor.Error('Group not found');
    }
    return group;
  },

  async getGroupWithMeetings(groupId) {
    check(groupId, String);

    const group = await Groups.findOneAsync({
      _id: groupId,
    });
    const groupActivities = await Meteor.callAsync('getGroupMeetingsFuture', groupId);

    return {
      ...group,
      meetings: groupActivities.map((a) => ({
        ...a.datesAndTimes[0],
        meetingId: a._id,
      })),
    };
  },

  async getGroupsWithMeetings(isPortalHost = false, host) {
    if (!host) {
      host = getHost(this);
    }
    try {
      const retrievedGroups = await Meteor.callAsync('getGroups', isPortalHost, host);
      const allGroupActivities = await Meteor.callAsync(
        'getAllGroupMeetingsFuture',
        isPortalHost,
        host
      );
      const parsedGroups = parseGroupsWithMeetings(retrievedGroups, allGroupActivities);
      return parsedGroups;
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(error);
    }
  },

  getGroups(isPortalHost = false, host) {
    const user = Meteor.user();
    if (!host) {
      host = getHost(this);
    }
    const allGroups = isPortalHost
      ? Groups.find({}, { sort: { creationDate: -1 } }).fetch()
      : Groups.find({ host }).fetch();
    const groupsFiltered = allGroups.filter((group) => {
      if (!group.isPrivate) {
        return true;
      }
      if (!user) {
        return false;
      }
      const userId = user._id;
      return (
        group.adminId === userId ||
        group.members.some((member) => member.memberId === userId) ||
        group.peopleInvited.some((person) => person.email === user.emails[0].address)
      );
    });

    return groupsFiltered.map((group) => ({
      _id: group._id,
      title: group.title,
      readingMaterial: group.readingMaterial,
      description: group.description,
      imageUrl: group.imageUrl,
      meetings: group.meetings,
      host: group.host,
      adminUsername: group.adminUsername,
      isArchived: group.isArchived,
      members: group.members,
      creationDate: group.creationDate,
      isPrivate: group.isPrivate,
      peopleInvited: group.peopleInvited,
    }));
  },

  getAllGroupMeetingsFuture(isPortalHost = false, host) {
    if (!host) {
      host = getHost(this);
    }

    const dateNow = new Date().toISOString();

    try {
      if (isPortalHost) {
        return Activities.find({
          isGroupMeeting: true,
          'datesAndTimes.startDate': { $gte: dateNow },
        }).fetch();
      }
      return Activities.find({
        host,
        isGroupMeeting: true,
      }).fetch();
    } catch (error) {
      throw new Meteor.Error(error, "Couldn't fetch data");
    }
  },

  getGroupMeetingsFuture(groupId) {
    check(groupId, String);

    const dateNow = new Date().toISOString().substring(0, 10);
    return Activities.find({
      groupId,
      isGroupMeeting: true,
      'datesAndTimes.startDate': { $gte: dateNow },
      datesAndTimes: { $exists: true, $ne: [] },
    }).fetch();
  },

  getGroupsByUser(username) {
    if (!username) {
      throw new Meteor.Error('Not allowed!');
    }
    const host = getHost(this);
    const platform = Platform.findOne();

    try {
      if (platform?.isFederationLayout) {
        return Groups.find({
          isPrivate: { $ne: true },
          isArchived: { $ne: true },
          $or: [{ authorUsername: username }, { 'members.username': username }],
        }).fetch();
      }
      return Groups.find({
        isPrivate: { $ne: true },
        isArchived: { $ne: true },
        $or: [{ authorUsername: username }, { 'members.username': username }],
        host,
      }).fetch();
    } catch (error) {
      throw new Meteor.Error(error, "Couldn't fetch groups");
    }
  },

  createGroup(formValues, imageUrl, isPrivate = false) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isContributorOrAdmin(user, currentHost)) {
      throw new Meteor.Error('Not allowed!');
    }

    const userAvatar = user.avatar ? user.avatar.src : null;

    try {
      const newGroupId = Groups.insert({
        host,
        authorId: user._id,
        authorUsername: user.username,
        authorAvatar: userAvatar,
        title: formValues.title,
        description: formValues.description,
        readingMaterial: formValues.readingMaterial,
        imageUrl,
        capacity: formValues.capacity,
        members: [
          {
            avatar: userAvatar,
            joinDate: new Date(),
            isAdmin: true,
            memberId: user._id,
            username: user.username,
          },
        ],
        isPublished: true,
        isPrivate,
        creationDate: new Date(),
      });

      Meteor.call('createChat', formValues.title, newGroupId, 'groups', (error) => {
        if (error) {
          console.log('Chat is not created due to error: ', error);
        }
      });

      try {
        Meteor.users.update(user._id, {
          $addToSet: {
            groups: {
              groupId: newGroupId,
              name: formValues.title,
              joinDate: new Date(),
              isAdmin: true,
            },
          },
        });
      } catch (error) {
        console.log(error);
        throw new Meteor.Error(
          error,
          "Couldn't add the group info to user collection, but group is created"
        );
      }
      return newGroupId;
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(error, "Couldn't add group to the collection");
    }
  },

  updateGroup(groupId, formValues, imageUrl) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isContributorOrAdmin(user, currentHost)) {
      throw new Meteor.Error('Not allowed!');
    }

    const theGroup = Groups.findOne(groupId);
    if (!isUserGroupAdmin(theGroup, user._id)) {
      throw new Meteor.Error('You are not allowed!');
    }

    check(formValues.title, String);
    check(formValues.description, String);
    check(formValues.capacity, Number);

    try {
      Groups.update(groupId, {
        $set: {
          title: formValues.title,
          description: formValues.description,
          readingMaterial: formValues.readingMaterial,
          capacity: formValues.capacity,
          imageUrl,
        },
      });

      Activities.update(
        {
          groupId,
        },
        {
          $set: {
            title: formValues.title,
            longDescription: formValues.description,
            images: [imageUrl],
          },
        }
      );
      return groupId;
    } catch (e) {
      throw new Meteor.Error(e, "Couldn't update the group");
    }
  },

  deleteGroup(groupId) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isContributorOrAdmin(user, currentHost)) {
      throw new Meteor.Error('Not allowed!');
    }

    const groupToDelete = Groups.findOne(groupId);

    if (!isUserGroupAdmin(groupToDelete, user._id)) {
      throw new Meteor.Error('You are not allowed!');
    }

    try {
      Groups.remove(groupId);
      return true;
    } catch (error) {
      throw new Meteor.Error(error, "Couldn't remove from collection");
    }
  },

  joinGroup(groupId) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isMember(user, currentHost)) {
      throw new Meteor.Error('Please join the community first!');
    }

    const theGroup = Groups.findOne(groupId);
    const alreadyMember = theGroup.members.some((m) => m.memberId === user._id);
    if (alreadyMember) {
      throw new Meteor.Error('You are already a member');
    }

    const currentHostName = currentHost?.settings?.name;
    const userAvatar = user.avatar ? user.avatar.src : null;
    const emailBody = getGroupRegistrationEmailBody(theGroup, currentHost, user);

    try {
      Groups.update(theGroup._id, {
        $addToSet: {
          members: {
            memberId: user._id,
            username: user.username,
            avatar: userAvatar,
            joinDate: new Date(),
          },
        },
      });

      Meteor.users.update(user._id, {
        $addToSet: {
          groups: {
            groupId: theGroup._id,
            name: theGroup.title,
            joinDate: new Date(),
          },
        },
      });

      console.log(theGroup);

      Meteor.call('sendEmail', user._id, `"${theGroup.title}", ${currentHostName}`, emailBody);
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(error, 'Could not join the circle');
    }
  },

  leaveGroup(groupId) {
    const user = Meteor.user();
    if (!user) {
      throw new Meteor.Error('You are not allowed!');
    }
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    const theGroup = Groups.findOne(groupId);
    const currentHostName = currentHost?.settings?.name;

    const emailBody = getGroupRegistrationEmailBody(theGroup, currentHost, user, true);
    try {
      Groups.update(theGroup._id, {
        $pull: {
          members: {
            memberId: user._id,
          },
        },
      });
      Meteor.users.update(user._id, {
        $pull: {
          groups: {
            groupId,
          },
        },
      });
      Meteor.call(
        'sendEmail',
        user._id,
        `"${theGroup.title}", ${currentHostName || publicSettings.name}`,
        emailBody
      );
    } catch (error) {
      throw new Meteor.Error('Could not leave the group');
    }
  },

  addGroupDocument(document, groupId) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isContributorOrAdmin(user, currentHost)) {
      throw new Meteor.Error('Not allowed!');
    }

    const theGroup = Groups.findOne(groupId);
    if (!isUserGroupAdmin(theGroup, user._id)) {
      throw new Meteor.Error('You are not admin!');
    }

    try {
      Groups.update(groupId, {
        $push: {
          documents: document,
        },
      });
    } catch (error) {
      throw new Meteor.Error('Could not add document due to:', error.reason);
    }
  },

  removeGroupDocument(documentName, groupId) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isContributorOrAdmin(user, currentHost)) {
      throw new Meteor.Error('Not allowed!');
    }

    const theGroup = Groups.findOne(groupId);
    if (!isUserGroupAdmin(theGroup, user._id)) {
      throw new Meteor.Error('You are not admin!');
    }

    const newDocuments = theGroup.documents.filter((document) => document.name !== documentName);

    try {
      Groups.update(groupId, {
        $set: {
          documents: newDocuments,
        },
      });
    } catch (error) {
      throw new Meteor.Error('Could not remove the document because: ', error.reason);
    }
  },

  setAsAGroupAdmin(groupId, newAdminUsername) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isContributorOrAdmin(user, currentHost)) {
      throw new Meteor.Error('Not allowed!');
    }

    const theGroup = Groups.findOne(groupId);
    if (!isUserGroupAdmin(theGroup, user._id)) {
      throw new Meteor.Error('You are not admin!');
    }

    const newAdmin = Meteor.users.findOne({ username: newAdminUsername });

    if (!isContributorOrAdmin(newAdmin, currentHost)) {
      throw new Meteor.Error('Admins must either have a cocreator or admin role in the space');
    }

    const newMembers = theGroup.members.map((member) => {
      if (member.username === newAdminUsername) {
        return {
          ...member,
          isAdmin: true,
        };
      }
      return {
        ...member,
      };
    });

    try {
      Groups.update(groupId, {
        $set: {
          members: newMembers,
        },
      });
    } catch (error) {
      throw new Meteor.Error('Could not change admin due to :', error.reason);
    }
  },

  archiveGroup(groupId) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isAdmin(user, currentHost)) {
      throw new Meteor.Error('Not allowed!');
    }

    const theGroup = Groups.findOne(groupId);
    if (!isUserGroupAdmin(theGroup, user._id)) {
      throw new Meteor.Error('You do not have admin privileges!');
    }

    try {
      Groups.update(groupId, {
        $set: {
          isArchived: true,
        },
      });
    } catch (error) {
      throw new Meteor.Error('Could not archive the group', error);
    }
  },

  unarchiveGroup(groupId) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isAdmin(user, currentHost)) {
      throw new Meteor.Error('Not allowed!');
    }

    const theGroup = Groups.findOne(groupId);
    if (!isUserGroupAdmin(theGroup, user._id)) {
      throw new Meteor.Error('You are not admin!');
    }

    try {
      Groups.update(groupId, {
        $set: {
          isArchived: false,
        },
      });
    } catch (error) {
      throw new Meteor.Error('Could not unarchive the group', error);
    }
  },

  invitePersonToPrivateGroup(groupId, person) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isContributorOrAdmin(user, currentHost)) {
      throw new Meteor.Error('Not allowed!');
    }

    const theGroup = Groups.findOne(groupId);
    if (!isUserGroupAdmin(theGroup, user._id)) {
      throw new Meteor.Error('You are not admin!');
    }

    if (!theGroup.isPrivate) {
      throw new Meteor.Error('This group is not private');
    }

    const invitedEmailsList = theGroup.peopleInvited.map((p) => p.email);

    if (invitedEmailsList.indexOf(person.email) !== -1) {
      throw new Meteor.Error('This email address is already added to the list');
    }

    const currentHostName = currentHost.settings?.name;
    const emailBody = getInviteToPrivateGroupEmailBody(theGroup, currentHost, user, person);

    try {
      Groups.update(groupId, {
        $addToSet: {
          peopleInvited: {
            email: person.email,
            firstName: person.firstName,
          },
        },
      });

      Meteor.call('sendEmail', person.email, `"${theGroup.title}", ${currentHostName}`, emailBody);
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(error, 'Could not send the invite to the person');
    }
  },

  removePersonFromInvitedList(groupId, person) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isContributorOrAdmin(user, currentHost)) {
      throw new Meteor.Error('Not allowed!');
    }

    const theGroup = Groups.findOne(groupId);
    if (!isUserGroupAdmin(theGroup, user._id)) {
      throw new Meteor.Error('You are not admin!');
    }

    if (!theGroup.isPrivate) {
      throw new Meteor.Error('This group is not private');
    }

    const invitedEmailsList = theGroup.peopleInvited.map((p) => p.email);

    if (invitedEmailsList.indexOf(person.email) === -1) {
      throw new Meteor.Error('The invite is not found');
    }

    try {
      Groups.update(groupId, {
        $pull: {
          peopleInvited: {
            email: person.email,
            firstName: person.firstName,
          },
        },
      });
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(error, 'Could not remove the invite');
    }
  },
});
