const userUtils = require('../utils/user');
const fileUtils = require('../utils/file');

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const { userId } = await userUtils.getUserAndKey(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
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
    await fileUtils.createFile(newFile);
    const out = await fileUtils.displayFileOut(newFile);

    if (type !== 'folder') {
      const { error } = await fileUtils.saveFile(FOLDER_PATH, data);
      if (error) {
        res.status(400).json(error);
        return;
      }
    }
    res.status(201).json(out);
  }

  static async getShow(req, res) {
    const { userId } = await userUtils.getUserAndKey(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await userUtils.getUserById(userId);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { id } = req.params;
    const file = await fileUtils.getFilesById(id);
    if (!file) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    const out = fileUtils.processFile(file);
    res.status(200).json(out);
  }

  static async getIndex(req, res) {
    const { userId } = await userUtils.getUserAndKey(req);
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = await userUtils.getUserById(userId);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { parentId = 0, page = 0 } = req.query;
    // let parentId = req.query.parentId || '0';
    // if (parentId === '0') parentId = 0;

    // let page = Number(req.query.page) || 0;
    // if (Number.isNaN(page)) page = 0;

    if (parentId !== 0 && parentId !== '0') {
      if (!parentId) {
        res.status(401).send({ error: 'Unauthorized' });
        return;
      }

      // const folder = await fileUtils.getFilesById(parentId);
      // if (!folder || folder.type !== 'folder') {
      //   res.status(200).send([]);
      //   return;
      // }
    }

    const listFile = await fileUtils.listFile({ parentId }, page);
    const fileList = [];
    await listFile.forEach((doc) => {
      const document = fileUtils.processFile(doc);
      fileList.push(document);
    });

    res.status(200).send(fileList);
  }
}

module.exports = FilesController;
