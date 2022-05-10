import { Meteor } from 'meteor/meteor';
import { getHost } from '../_utils/shared';
import Documents from './document';

Meteor.methods({
  getDocumentsByAttachments(attachedTo) {
    const host = getHost(this);
    const sort = {};
    const fields = Documents.publicFields;
    const documents = Documents.find({ host, attachedTo }, { sort, fields }).fetch();
    return documents;
  },

  createDocument(documentLabel, documentUrl, contextType, attachedTo) {
    const user = Meteor.user();
    if (!user) {
      return;
    }

    const host = getHost(this);

    try {
      Documents.insert({
        host,
        documentLabel,
        documentUrl,
        contextType,
        attachedTo,
        uploadedUsername: user.username,
        uploadedBy: user._id,
        uploadedByName: user.username,
        creationDate: new Date(),
      });
    } catch (error) {
      throw new Meteor.Error(error, "Couldn't create the document");
    }
  },

  removeManual(documentId) {
    const user = Meteor.user();
    if (!user || !user.isSuperAdmin) {
      throw new Meteor.Error('You do not have the privileges');
    }

    try {
      Documents.remove(documentId);
    } catch (error) {
      throw new Meteor.Error(error, "Couldn't delete the document");
    }
  },
});
