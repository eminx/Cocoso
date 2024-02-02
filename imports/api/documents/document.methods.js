import { Meteor } from 'meteor/meteor';
import { getHost } from '../_utils/shared';
import Documents from './document';
import Processes from '../processes/process';
import Works from '../works/work';
import Resources from '../resources/resource';
import Hosts from '../hosts/host';
import { isAdmin } from '../users/user.roles';

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
      console.log(error);
      throw new Meteor.Error(error, "Couldn't create the document");
    }
  },

  removeDocument(documentId) {
    const user = Meteor.user();
    const host = getHost(this);
    const currentHost = Hosts.findOne({ host });

    if (!user || !isAdmin(user, currentHost)) {
      throw new Meteor.Error('Not allowed!');
    }

    try {
      Documents.remove(documentId);
    } catch (error) {
      console.log(error);
      throw new Meteor.Error(error, "Couldn't delete the document");
    }
  },
});
