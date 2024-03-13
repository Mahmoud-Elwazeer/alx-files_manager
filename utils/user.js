import redisClient from './redis';
import dbClient from './db';

const ObjectId = require('mongodb').ObjectID;

const userUtils = {
  async getUserAndKey(req) {
    const obj = { userId: null, key: null };

    const xToken = req.header('X-Token');

    if (!xToken) return obj;

    obj.key = `auth_${xToken}`;

    obj.userId = await redisClient.get(obj.key);

    return obj;
  },
  async createUser(query) {
    const createuser = await dbClient.db.collection('users').insertOne(query);
    return createuser;
  },
  async getUser(query) {
    const user = await dbClient.db.collection('users').findOne(query);
    return user;
  },
  async getUserById(userId) {
    const objectId = new ObjectId(userId);
    const userObj = await dbClient.db.collection('users').findOne({ _id: objectId });
    return userObj;
  },

  async checkAuth(req) {
    const obj = { userId: null, user: null, auth: false };
    const { userId } = await this.getUserAndKey(req);
    if (!userId) {
      return obj;
    }
    const user = await this.getUserById(userId);
    if (!user) {
      return obj;
    }
    obj.userId = userId;
    obj.user = user;
    obj.auth = true;
    return obj;
  },
};
module.exports = userUtils;
// export default userUtils;
