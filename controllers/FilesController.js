import { promises as fsPromises } from 'fs';
import dbClient from '../utils/db';
import basicUtils from '../utils/basic';

const { v4: uuidv4 } = require('uuid');
const userUtils = require('../utils/user');
const fileUtils = require('../utils/file');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const { userId } = await userUtils.getUserAndKey(req);
    if (!basicUtils.isValidId(userId)) {
      res.status(401).send({ error: 'Unauthorized' });
      return;
    }

    const user = await userUtils.getUserById(userId);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const {
      name,
      type,
      data,
      parentId = 0,
      isPublic = false,
    } = req.body;

    const acceptType = ['folder', 'file', 'image'];
    if (!name) {
      res.status(400).json({ error: 'Missing name' });
      return;
    }
    if (!type || !acceptType.includes(type)) {
      res.status(400).json({ error: 'Missing type' });
      return;
    }
    if (!data && type !== 'folder') {
      res.status(400).json({ error: 'Missing data' });
      return;
    }
    if (parentId) {
      const parentFile = fileUtils.getFilesById(parentId);

      if (!parentFile) {
        res.status(400).json({ error: 'Parent not found' });
        return;
      }
      if (parentFile.type !== 'folder') {
        res.status(400).json({ error: 'Parent is not a folder' });
        return;
      }
    }
    const newFile = {
      userId,
      name,
      type,
      isPublic,
      parentId,
    };
    const createFile = await dbClient.db.collection('files').insertOne(newFile);
    const out = {
      id: createFile.insertedId,
      userId,
      name,
      type,
      isPublic,
      parentId,
    };
    if (type !== 'folder') {
      const filename = uuidv4();
      // Decode the Base64 data to obtain the file content
      const fileContent = Buffer.from(data, 'base64');

      const path = `${FOLDER_PATH}/${filename}`;

      try {
        // Write the file content to the local path
        await fsPromises.mkdir(FOLDER_PATH, { recursive: true });
        await fsPromises.writeFile(path, fileContent);
      } catch (err) {
        res.status(400).json({ error: err.message });
        return;
      }
    }
    res.status(201).json(out);
  }
}

module.exports = FilesController;
