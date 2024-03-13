import dbClient from './db';

const ObjectId = require('mongodb').ObjectID;

async function getFile(query) {
  const file = await dbClient.db.collection('files').findOne(query);
  return file;
}

async function getFilesById(id) {
  const objectId = new ObjectId(id);
  const file = await dbClient.db.collection('files').findOne({ _id: objectId });
  return file;
}

module.exports = {
  getFile,
  getFilesById,
};
