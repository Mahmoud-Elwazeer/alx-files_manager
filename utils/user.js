import redisClient from './redis';
import dbClient from './db';

const ObjectId = require('mongodb').ObjectID;

async function getUserAndKey(req) {
  const obj = { userId: null, key: null };

  const xToken = req.header('X-Token');

  if (!xToken) return obj;

  obj.key = `auth_${xToken}`;

  obj.userId = await redisClient.get(obj.key);

  return obj;
}

async function getUser(query) {
  const user = await dbClient.db.collection('users').findOne(query);
  return user;
}

async function getUserById(userId) {
  const objectId = new ObjectId(userId);
  const userObj = await dbClient.db.collection('users').findOne({ _id: objectId });
  return userObj;
}

// module.exports = userUtils;
// export default userUtils;
module.exports = {
  getUserAndKey,
  getUser,
  getUserById,
};
