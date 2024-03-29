import { promises as fsPromises, existsSync } from 'fs';
import dbClient from './db';

const { v4: uuidv4 } = require('uuid');
const ObjectId = require('mongodb').ObjectID;

const ITEMS_PER_PAGE = 20;

const fileUtils = {
  async createFile(query) {
    const createfile = await dbClient.db.collection('files').insertOne(query);
    return createfile;
  },

  async updateFileById(id, userId, newData) {
    const objectId = new ObjectId(id);
    const updatefile = await dbClient.db.collection('files').updateOne(
      { _id: objectId, userId },
      { $set: newData },
      { returnOriginal: false },
    );
    return updatefile;
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

  async getFilesByIdAndUser(id, userId) {
    const objectId = new ObjectId(id);
    const file = await dbClient.db.collection('files').findOne({ _id: objectId, userId });
    return file;
  },

  async saveFile(FOLDER_PATH, data) {
    const filename = uuidv4();
    // Decode the Base64 data to obtain the file content
    const fileContent = Buffer.from(data, 'base64');

    const path = `${FOLDER_PATH}/${filename}`;

    try {
      // Write the file content to the local path
      await fsPromises.mkdir(FOLDER_PATH, { recursive: true });
      await fsPromises.writeFile(path, fileContent);
    } catch (err) {
      return ({ error: err.message, path: null });
    }
    return { error: null, path };
  },

  async listFile(query, page) {
    const files = await dbClient.db.collection('files').aggregate([
      { $match: query }, // Filter by parentId and ownerId
      { $skip: page * ITEMS_PER_PAGE }, // Skip the appropriate number of files
      { $limit: ITEMS_PER_PAGE }, // Limit the results to the number of items per page
    ]);

    return files;
  },

  processFile(doc) {
    // Changes _id for id and removes localPath

    const file = { id: doc._id, ...doc };

    delete file.localPath;
    delete file._id;

    return file;
  },

  async checkFileExists(path) {
    if (existsSync(path)) {
      return true;
    }
    return false;
  },

  async readFile(path) {
    const obj = { data: null, error: null };
    try {
      obj.data = await fsPromises.readFile(path);
    } catch (err) {
      // console.log(err.message);
      obj.error = 'Not found';
    }
    return obj;
  },

};

module.exports = fileUtils;
