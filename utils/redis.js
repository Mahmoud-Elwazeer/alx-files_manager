const redis = require('redis');
const util = require('util');

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.client.on('connect', () => {
      // console.log('Redis Client Connected')
    });
    this.client.on('error', (err) => {
      console.log(`Redis Client Error ${err}`);
    });

    // Promisify the get method
    this.getAsync = util.promisify(this.client.get).bind(this.client);
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    const value = await this.getAsync(key);
    return value;
  }

  async set(key, value, expireInSec) {
    await this.client.set(key, value);
    if (expireInSec) {
      this.client.expire(key, expireInSec);
    }
  }

  async del(key) {
    await this.client.del(key);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
// export default redisClient;
