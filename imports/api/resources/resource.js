import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Schemas } from '../@/schemas';

const Resources = new Mongo.Collection('resources');

Resources.schema = new SimpleSchema({
  _id: Schemas.Id,
  host: Schemas.Hostname,
  userId: Schemas.Id,

  label: {type: String},
  description: {type: String, optional: true},
  images: { type: Array, optional: true },
  'images.$': Schemas.Src,

  isCombo: {type: Boolean, optional: true},
  resourceIndex: {type: SimpleSchema.Integer},
  resourcesForCombo: {type: Array},
  'resourcesForCombo.$': Schemas.Id,

  createdBy: {type: String, optional: true},
  createdAt: {type: Date, optional: true},
  updatedBy: {type: String, optional: true},
  updatedAt: {type: Date, optional: true},
});

Resources.attachSchema(Resources.schema);

Resources.publicFields = {
  userId: 1,
  label: 1,
  description: 1,
  images: 1,
  isCombo: 1,
  resourcesForCombo: 1,
  resourceIndex: 1,
  createdAt: 1,
};

export default Resources;