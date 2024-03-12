const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('connect', () => {
      // console.log('Redis Client Connected')
    });
    this.client.on('error', (err) => {
      console.log(`Redis Client Error ${err}`);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  get(key) {
    return new Promise((res, rej) => {
      this.client.get(key, (err, reply) => {
        if (err) {
          rej(err);
        } else {
          res(reply);
        }
      });
    });
  }

  set(key, value, expireInSec) {
    return new Promise((res, rej) => {
      this.client.set(key, value, (err, reply) => {
        if (err) {
          rej(err);
        } else {
          if (expireInSec) {
            this.client.expire(key, expireInSec);
          }
          res(reply);
        }
      });
    });
  }

  del(key) {
    return new Promise((res, rej) => {
      this.client.del(key, (err, reply) => {
        if (err) {
          rej(err);
        } else {
          res(reply);
        }
      });
    });
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
// export default redisClient;
