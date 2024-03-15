import mime from 'mime-types';

const userUtils = require('../utils/user');
const fileUtils = require('../utils/file');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const { userId, auth } = await userUtils.checkAuth(req);
    if (!auth) {
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
      const parentFile = await fileUtils.getFilesById(parentId);

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

    if (type !== 'folder') {
      const { error, path } = await fileUtils.saveFile(FOLDER_PATH, data);
      if (error) {
        res.status(400).json(error);
        return;
      }
      newFile.localPath = path;
    }
    await fileUtils.createFile(newFile);
    const out = fileUtils.processFile(newFile);
    res.status(201).json(out);
  }

  static async getShow(req, res) {
    const { userId, auth } = await userUtils.checkAuth(req);
    if (!auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    if (!id) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    let file;
    try {
      file = await fileUtils.getFilesById(id);
      if (file.userId !== userId) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
    } catch (err) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const out = fileUtils.processFile(file);
    res.status(200).json(out);
  }

  static async getIndex(req, res) {
    const { userId, auth } = await userUtils.checkAuth(req);
    if (!auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { parentId = 0, page = 0 } = req.query;

    if (parentId !== 0 && parentId !== '0') {
      if (!parentId) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      let file;
      try {
        file = await fileUtils.getFilesById(parentId);
      } catch (err) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      // const listFile = await fileUtils.listFile({ parentId, userId }, page);
      // if (!listFile || listFile.type === 'folder') {
      //   res.status(200).send([]);
      //   return;
      // }
      // const fileList = [];
      // await listFile.forEach((doc) => {
      //   const document = fileUtils.processFile(doc);
      //   fileList.push(document);
      // });

      res.status(200).send(file);
      return;
    }

    const listFile = await fileUtils.listFile({ userId }, page);
    const fileList = [];
    await listFile.forEach((doc) => {
      const document = fileUtils.processFile(doc);
      fileList.push(document);
    });

    res.status(200).send(fileList);
  }

  static async putPublish(req, res) {
    const { userId, auth } = await userUtils.checkAuth(req);
    if (!auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    if (!id) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    let file;
    try {
      file = await fileUtils.getFilesByIdAndUser(id, userId);
    } catch (err) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    try {
      const newData = { isPublic: true };
      await fileUtils.updateFileById(id, userId, newData);
      file = await fileUtils.getFilesById(id);
      const out = fileUtils.processFile(file);
      res.status(200).json(out);
    } catch (err) {
      res.status(404).json({ error: 'Not found' });
    }
  }

  static async putUnpublish(req, res) {
    const { userId, auth } = await userUtils.checkAuth(req);
    if (!auth) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    if (!id) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    let file;
    try {
      file = await fileUtils.getFilesByIdAndUser(id, userId);
    } catch (err) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    try {
      const newData = { isPublic: false };
      await fileUtils.updateFileById(id, userId, newData);
      file = await fileUtils.getFilesByIdAndUser(id, userId);
      const out = fileUtils.processFile(file);
      res.status(200).json(out);
    } catch (err) {
      res.status(404).json({ error: 'Not found' });
    }
  }

  static async getFile(req, res) {
    const { userId, auth } = await userUtils.checkAuth(req);
    const { id } = req.params;
    if (!id) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    let file;
    try {
      file = await fileUtils.getFilesByIdAndUser(id, userId);
    } catch (err) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    if (!file.type) {
      if (!auth) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      if (userId !== file.userId) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
    }
    if (file.type === 'folder') {
      res.status(400).json({ error: 'A folder doesn\'t have content' });
      return;
    }
    if (!fileUtils.checkFileExists(file.localPath)) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const { data, error } = await fileUtils.readFile(file.localPath);
    if (!error) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const mimeType = mime.contentType(file.name);

    res.setHeader('Content-Type', mimeType);

    res.status(200).send(data);
  }
}

module.exports = FilesController;
