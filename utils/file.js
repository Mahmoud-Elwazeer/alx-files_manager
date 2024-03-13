import { promises as fsPromises } from 'fs';
import dbClient from './db';

const { v4: uuidv4 } = require('uuid');
const ObjectId = require('mongodb').ObjectID;

const ITEMS_PER_PAGE = 20;

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
      return ({ error: err.message });
    }
    return { error: null };
  },

  async displayFileOut(query) {
    const file = await dbClient.db.collection('files').findOne(query);
    const out = {
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    };
    return out;
  },

  async listFile(query, pageNumber) {
    const files = await dbClient.db.collection('files').aggregate([
      { $match: query }, // Filter by parentId and ownerId
      { $skip: pageNumber * ITEMS_PER_PAGE }, // Skip the appropriate number of files
      { $limit: ITEMS_PER_PAGE }, // Limit the results to the number of items per page
    ]);

    return files;
  },

};

module.exports = fileUtils;
