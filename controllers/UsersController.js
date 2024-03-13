import basicUtils from '../utils/basic';

const crypto = require('crypto');
const userUtils = require('../utils/user');

function sha1(password) {
  return crypto.createHash('sha1').update(password).digest('hex');
}

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }
    const user = await userUtils.getUser({ email });
    if (user) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }
    const hashPass = sha1(password);
    const newUser = { email, password: hashPass };
    const createUser = await userUtils.createUser(newUser);
    const out = { id: createUser.insertedId, email };
    res.status(201).json(out);
  }

  static async getMe(req, res) {
    const { userId } = await userUtils.getUserAndKey(req);
    if (!basicUtils.isValidId(userId)) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await userUtils.getUserById(userId);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    res.status(200).json({ id: userId, email: user.email });
  }
}

module.exports = UsersController;
