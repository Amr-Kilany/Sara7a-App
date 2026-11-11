import { redisClient } from "./redis-connection.js";

/*
|--------------------------------------------------------------------------
| Redis Key Helpers
|--------------------------------------------------------------------------
*/

export const revokeTokenKeyPrefix = ({ userId }) => {
  return `user:revokeToken:${userId}`;
};

export const revokeTokenKey = ({ userId, jti }) => {
  return `${revokeTokenKeyPrefix({ userId })}:${jti}`;
};

/*
|--------------------------------------------------------------------------
| SET
|--------------------------------------------------------------------------
*/

export const set = async ({ key, value, ttl = null }) => {
  try {
    const data = typeof value === "string" ? value : JSON.stringify(value);

    // Set with expiration
    if (ttl !== null && ttl !== undefined) {
      return await redisClient.set(key, data, {
        EX: ttl,
      });
    }

    // Set without expiration
    return await redisClient.set(key, data);
  } catch (error) {
    console.error("Redis Set Error:", error);
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

export const get = async ({ key }) => {
  try {
    return await redisClient.get(key);
  } catch (error) {
    console.error("Redis Get Error:", error);
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE
|--------------------------------------------------------------------------
*/

export const update = async ({ key, value, ttl = null }) => {
  try {
    const isExists = await redisClient.exists(key);

    if (!isExists) {
      return false;
    }

    const data = typeof value === "string" ? value : JSON.stringify(value);

    if (ttl !== null && ttl !== undefined) {
      return await redisClient.set(key, data, {
        EX: ttl,
      });
    }

    return await redisClient.set(key, data);
  } catch (error) {
    console.error("Redis Update Error:", error);
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

export const del = async ({ key }) => {
  try {
    const isExists = await redisClient.exists(key);

    if (!isExists) {
      return false;
    }

    return await redisClient.del(key);
  } catch (error) {
    console.error("Redis Delete Error:", error);
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| EXPIRE
|--------------------------------------------------------------------------
*/

export const expire = async ({ key, ttl }) => {
  try {
    const isExists = await redisClient.exists(key);

    if (!isExists) {
      return false;
    }

    return await redisClient.expire(key, ttl);
  } catch (error) {
    console.error("Redis Expire Error:", error);
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| TTL
|--------------------------------------------------------------------------
*/

export const ttl = async ({ key }) => {
  try {
    const isExists = await redisClient.exists(key);

    if (!isExists) {
      return false;
    }

    return await redisClient.ttl(key);
  } catch (error) {
    console.error("Redis TTL Error:", error);
    throw error;
  }
};

/*
|--------------------------------------------------------------------------
| KEYS
|--------------------------------------------------------------------------
*/

export const keys = async ({ pattern }) => {
  try {
    return await redisClient.keys(pattern);
  } catch (error) {
    console.error("Redis KEYS Error:", error);
    throw error;
  }
};
