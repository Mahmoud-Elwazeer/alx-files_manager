import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const ObjectId = require('mongodb').ObjectID;

class FilesController {
  static async postUpload(req, res) {
    const authHeader = req.header('X-Token');
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const userId = await redisClient.get(`auth_${authHeader}`);
    const objectId = new ObjectId(userId);
    const user = await dbClient.db.collection('users').findOne({ _id: objectId });
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { name, type, data, parentId = 0, isPublic = false } = req.body;
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
      const objectIdParent = new ObjectId(parentId);
      const parentFile = await dbClient.db.collection('files').findOne({ _id: objectIdParent });
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
    res.status(201).json(out);
  }
}

module.exports = FilesController;
