import { Meteor } from 'meteor/meteor';
import { Migrations } from 'meteor/percolate:migrations';

import Resources from '../../api/resources/resource';
import Hosts from '../../api/hosts/host';
import Activities from '../../api/activities/activity';

/* eslint-disable no-console */

// Drop && Set back - authorAvatar && authorFirstName && authorLastName
Migrations.add({
  version: 1,
  async up() {
    console.log('up to', this.version);
    Resources.update({}, { $unset: { authorAvatar: true } }, { multi: true });
    Resources.update({}, { $unset: { authorFirstName: true } }, { multi: true });
    Resources.update({}, { $unset: { authorLastName: true } }, { multi: true });
  },
  async down() {
    console.log('down to', this.version - 1);
    Resources.find({ authorId: { $exists: true } }).forEach((item) => {
      const user = Meteor.users.findOne(item.authorId);
      Resources.update({ _id: item._id }, { $set: { authorAvatar: user.avatar } });
      Resources.update({ _id: item._id }, { $set: { authorFirstName: user.firstName } });
      Resources.update({ _id: item._id }, { $set: { authorLastName: user.lastName } });
    });
  },
});

// Drop && Set back - labelLowerCase
Migrations.add({
  version: 2,
  async up() {
    console.log('up to', this.version);
    Resources.update({}, { $unset: { labelLowerCase: true } }, { multi: true });
  },
  async down() {
    console.log('down to', this.version - 1);
    Resources.find({ _id: { $exists: true } }).forEach((item) => {
      const labelLowerCase = item.label.toLowerCase();
      Resources.update(item._id, { $set: { labelLowerCase } });
    });
  },
});

// Change - resourcesForCombo - arrayOfObjects <=> arrayOfIds
Migrations.add({
  version: 3,
  async up() {
    console.log('up to', this.version);
    Resources.find({ isCombo: true }).forEach((item) => {
      const resourcesForCombo = [];
      item.resourcesForCombo.forEach((res) => {
        resourcesForCombo.push(res._id);
      });
      Resources.update(item._id, { $set: { resourcesForCombo } });
    });
  },
  async down() {
    console.log('down to', this.version - 1);
    Resources.find({ isCombo: true }).forEach((item) => {
      const resourcesForCombo = Resources.find(
        { _id: { $in: item.resourcesForCombo } },
        { fields: { _id: 1, label: 1, description: 1, resourceIndex: 1 } }
      ).fetch();
      Resources.update(item._id, { $set: { resourcesForCombo } });
    });
  },
});

// Switch between - creationDate <=> createdAt
Migrations.add({
  version: 4,
  async up() {
    console.log('up to', this.version);
    Resources.find({ creationDate: { $exists: true } }).forEach((item) => {
      const createdAt = item.creationDate;
      Resources.update(item._id, { $set: { createdAt } });
    });
    Resources.update({}, { $unset: { creationDate: true } }, { multi: true });
  },
  async down() {
    console.log('down to', this.version - 1);
    Resources.find({ createdAt: { $exists: true } }).forEach((item) => {
      const creationDate = item.createdAt;
      Resources.update(item._id, { $set: { creationDate } });
    });
    Resources.update({}, { $unset: { createdAt: true } }, { multi: true });
  },
});

// Switch between - latestUpdate <=> updatedAt
Migrations.add({
  version: 5,
  async up() {
    console.log('up to', this.version);
    Resources.find({ latestUpdate: { $exists: true } }).forEach((item) => {
      const updatedAt = item.latestUpdate;
      Resources.update(item._id, { $set: { updatedAt } });
    });
    Resources.update({}, { $unset: { latestUpdate: true } }, { multi: true });
  },
  async down() {
    console.log('down to', this.version - 1);
    Resources.find({ updatedAt: { $exists: true } }).forEach((item) => {
      const latestUpdate = item.updatedAt;
      Resources.update(item._id, { $set: { latestUpdate } });
    });
    Resources.update({}, { $unset: { updatedAt: true } }, { multi: true });
  },
});

// Switch between - authorId <=> userId
Migrations.add({
  version: 6,
  async up() {
    console.log('up to', this.version);
    Resources.find({ authorId: { $exists: true } }).forEach((item) => {
      const userId = item.authorId;
      Resources.update(item._id, { $set: { userId } });
    });
    Resources.update({}, { $unset: { authorId: true } }, { multi: true });
  },
  async down() {
    console.log('down to', this.version - 1);
    Resources.find({ userId: { $exists: true } }).forEach((item) => {
      const authorId = item.userId;
      Resources.update(item._id, { $set: { authorId } });
    });
    Resources.update({}, { $unset: { userId: true } }, { multi: true });
  },
});

// Switch between - authorUsername <=> createdBy
Migrations.add({
  version: 7,
  async up() {
    console.log('up to', this.version);
    Resources.find({ authorUsername: { $exists: true } }).forEach((item) => {
      const createdBy = item.authorUsername;
      Resources.update(item._id, { $set: { createdBy } });
    });
    Resources.update({}, { $unset: { authorUsername: true } }, { multi: true });
  },
  async down() {
    console.log('down to', this.version - 1);
    Resources.find({ createdBy: { $exists: true } }).forEach((item) => {
      const authorUsername = item.createdBy;
      Resources.update(item._id, { $set: { authorUsername } });
    });
    Resources.update({}, { $unset: { createdBy: true } }, { multi: true });
  },
});

// Switch between - authorUsername <=> createdBy
Migrations.add({
  version: 8,
  async up() {
    console.log('up to', this.version);
    Hosts.find({ 'settings.menu': { $exists: true } }).forEach((item) => {
      if (!item.settings.menu.find((menuItem) => menuItem?.name === 'resource')) {
        const menu = [
          ...item.settings.menu,
          {
            label: 'Resources',
            name: 'resources',
            isVisible: false,
            isHomePage: false,
          },
        ];
        Hosts.update(item._id, { $set: { 'settings.menu': menu } });
      }
    });
  },
  async down() {
    console.log('down to', this.version - 1);
    Hosts.find({ 'settings.menu': { $exists: true } }).forEach((item) => {
      const menu = [];
      item.settings.menu.forEach((menuItem) => {
        if (menuItem.name !== 'resources') {
          menu.push(item);
        }
      });
      Hosts.update(item._id, { $set: { 'settings.menu': menu } });
    });
  },
});

// Return embedding resource objects in resourcesForCombo rather than using only _ids
Migrations.add({
  version: 9,
  async up() {
    console.log('up to', this.version);
    Resources.find({ isCombo: true }).forEach((item) => {
      const resourcesForCombo = Resources.find(
        { _id: { $in: item.resourcesForCombo } },
        { fields: { _id: 1, label: 1, description: 1, resourceIndex: 1 } }
      ).fetch();
      Resources.update(item._id, { $set: { resourcesForCombo } });
    });
  },
  async down() {
    console.log('down to', this.version - 1);
    Resources.find({ isCombo: true }).forEach((item) => {
      const resourcesForCombo = [];
      item.resourcesForCombo.forEach((res) => {
        resourcesForCombo.push(res?._id);
      });
      Resources.update(item._id, { $set: { resourcesForCombo } });
    });
  },
});

// Add exclusive switch to all activities
Migrations.add({
  version: 10,
  async up() {
    console.log('up to', this.version);
    Activities.find().forEach((item) => {
      Activities.update(
        { _id: item._id },
        {
          $set: {
            isExclusiveActivity: true,
          },
        }
      );
    });
  },
  async down() {
    console.log('down to', this.version - 1);
    Activities.find().forEach((item) => {
      Activities.update(
        { _id: item._id },
        {
          $unset: {
            isExclusiveActivity: 1,
          },
        }
      );
    });
  },
});

// Run migrations
Meteor.startup(() => {
  // Migrations.migrateTo(0);
  // Migrations.migrateTo(0);
  // Migrations.migrateTo(2);
  // Migrations.migrateTo(3);
  // Migrations.migrateTo(4);
  // Migrations.migrateTo(5);
  // Migrations.migrateTo(6);
  // Migrations.migrateTo(7);
  // Migrations.migrateTo(8);
  // Migrations.migrateTo(9);
  // Migrations.migrateTo(10);
  // Migrations.migrateTo('latest');
});

/* eslint-enable no-console */
