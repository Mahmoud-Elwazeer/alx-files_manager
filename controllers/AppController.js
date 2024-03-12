import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  static getStatus(_, res) {
    res.status(200).json({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
  }

  static getStats(_, res) {
    Promise.all([dbClient.nbUsers(), dbClient.nbFiles()])
      .then(([usercount, filecount]) => {
        res.status(200).json({ users: usercount, files: filecount });
      });
  }
}

// export default AppController;
module.exports = AppController;
