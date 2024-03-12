import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

function sha1(password) {
  return crypto.createHash('sha1').update(password).digest('hex');
}

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const email = credentials.split(':')[0];
    const pass = credentials.split(':')[1];
    const hashPass = sha1(pass);

    const user = await dbClient.db.collection('users').findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    if (hashPass !== user.password) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id.toString(), 24 * 60 * 60);

    res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const authHeader = req.header('X-Token');
    if (!authHeader) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    await redisClient.del(`auth_${authHeader}`);
    res.status(204).send();
  }
}

module.exports = AuthController;
