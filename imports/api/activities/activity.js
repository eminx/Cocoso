import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Schemas } from '../_utils/schemas';

const Activities = new Mongo.Collection('activities');

Activities.schema = new SimpleSchema({
  _id: Schemas.Id,
  host: Schemas.Hostname,

  authorId: Schemas.Id,
  authorName: { type: String },

  title: { type: String },
  subTitle: {
    type: String,
    optional: true,
  },
  longDescription: { type: String, optional: true },
  imageUrl: { type: String, optional: true },

  resourceId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
  resource: { type: String, optional: true },
  resourceIndex: { type: SimpleSchema.Integer, optional: true },

  address: { type: String, optional: true },
  capacity: { type: SimpleSchema.Integer, defaultValue: 20 },
  place: { type: String, optional: true },

  datesAndTimes: { type: Array },
  'datesAndTimes.$': new SimpleSchema({
    startDate: { type: String },
    startTime: { type: String },
    endDate: { type: String },
    endTime: { type: String },
    capacity: { type: SimpleSchema.Integer, optional: true },
    isRange: { type: Boolean, optional: true },
    conflict: { type: String, optional: true },

    resource: { type: String, optional: true },
    resourceIndex: { type: SimpleSchema.Integer, optional: true },

    attendees: { type: Array, optional: true },
    'attendees.$': {
      type: new SimpleSchema({
        email: Schemas.Email,
        username: { type: String, optional: true },
        firstName: { type: String, optional: true },
        lastName: { type: String, optional: true },
        numberOfPeople: { type: SimpleSchema.Integer, optional: true },
        registerDate: { type: Date },
      }),
      optional: true,
    },
  }),

  // practicalInfo: { type: String, optional: true }, // null
  // internalInfo: { type: String, optional: true }, // null

  isExclusiveActivity: { type: Boolean, optional: true },
  isSentForReview: { type: Boolean },
  isPublicActivity: { type: Boolean, optional: true },
  isRegistrationDisabled: { type: Boolean, optional: true },
  isPublished: { type: Boolean },

  groupId: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
  isGroupMeeting: { type: Boolean, optional: true },
  isGroupPrivate: { type: Boolean, optional: true },

  latestUpdate: { type: Date, optional: true },
  creationDate: { type: Date },
});

Activities.attachSchema(Activities.schema);

export default Activities;
