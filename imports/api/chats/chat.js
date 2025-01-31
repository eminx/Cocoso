import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Schemas } from '../_utils/schemas';

const Chats = new Mongo.Collection('chats');

Chats.schema = new SimpleSchema({
  _id: Schemas.Id,
  host: Schemas.Hostname,

  contextId: { type: String },
  contextName: { type: String },
  contextType: { type: String },

  createdBy: { type: Object },
  'createdBy.userId': Schemas.Id,
  'createdBy.username': { type: String },

  messages: { type: Array, optional: true },
  'messages.$': { type: Object },
  'messages.$.senderId': Schemas.Id,
  'messages.$.senderUsername': { type: String },
  'messages.$.content': { type: String },
  'messages.$.createdDate': { type: Date },

  isNotificationOn: { type: Boolean },
  lastMessageBy: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
});

Chats.attachSchema(Chats.schema);

export default Chats;
