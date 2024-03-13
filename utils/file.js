import dbClient from './db';

const ObjectId = require('mongodb').ObjectID;

const fileUtils = {
  async createFile(query) {
    const createfile = await dbClient.db.collection('files').insertOne(query);
    return createfile;
  },
  async getFile(query) {
    const file = await dbClient.db.collection('files').findOne(query);
    return file;
  },
  async getFilesById(id) {
    const objectId = new ObjectId(id);
    const file = await dbClient.db.collection('files').findOne({ _id: objectId });
    return file;
  },
};

module.exports = fileUtils;
