import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  static getStatus(_, res) {
    if (redisClient.isAlive && dbClient.isAlive) {
      res.status(200).json({ redis: true, db: true });
    } else {
      res.status(404);
    }
  }

  static getStats(_, res) {
    const nUsers = dbClient.nbUsers();
    const nFiles = dbClient.nbFiles();
    res.status(200).json({ users: nUsers, files: nFiles });
  }
}

// export default AppController;
module.exports = AppController;
