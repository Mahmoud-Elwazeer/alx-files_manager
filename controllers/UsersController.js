import dbClient from '../utils/db';

const crypto = require('crypto');

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
    const user = await dbClient.db.collection('users').findOne({ email });
    if (user) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }
    const hashPass = sha1(password);
    const newUser = { email, password: hashPass };
    const createUser = await dbClient.db.collection('users').insertOne(newUser);
    const out = { id: createUser.insertedId, email };
    res.status(200).json(out);
  }
}

module.exports = UsersController;
