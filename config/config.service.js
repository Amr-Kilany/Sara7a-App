import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const NODE_ENV = process.env.NODE_ENV || "development";

const envPath = {
  development: ".env.dev",
  staging: ".env.staging",
  production: ".env.prod",
};

// Always resolves relative to the config directory
dotenv.config({ path: resolve(__dirname, envPath[NODE_ENV]) });

export const PORT = process.env.PORT || 5000;
export const DB_URI = process.env.DB_URI;
export const SALT_ROUNDS = process.env.SALT_ROUNDS || 10;
export const ENC_KEY = process.env.ENC_KEY;

// Tokens
export const ACCESS_TOKEN_USER_SECRET = process.env.ACCESS_TOKEN_USER_SECRET;
export const REFRESH_TOKEN_USER_SECRET = process.env.REFRESH_TOKEN_USER_SECRET;
export const ACCESS_TOKEN_USER_EXPIRATION = process.env.ACCESS_TOKEN_USER_EXPIRATION || 3600;
export const REFRESH_TOKEN_USER_EXPIRATION = process.env.REFRESH_TOKEN_USER_EXPIRATION || 7200;

export const ACCESS_TOKEN_ADMIN_SECRET = process.env.ACCESS_TOKEN_ADMIN_SECRET;
export const REFRESH_TOKEN_ADMIN_SECRET = process.env.REFRESH_TOKEN_ADMIN_SECRET;
export const ACCESS_TOKEN_ADMIN_EXPIRATION = process.env.ACCESS_TOKEN_ADMIN_EXPIRATION || 86400;
export const REFRESH_TOKEN_ADMIN_EXPIRATION = process.env.REFRESH_TOKEN_ADMIN_EXPIRATION || 172800;

export const CLIENT_ID = process.env.CLIENT_ID;

export const USER_EMAIL = process.env.USER_EMAIL;
export const USER_PASS = process.env.USER_PASS;

export const WHITE_LIST = process.env.WHITE_LIST;

export const { UPSTASH_REDIS_HOST, UPSTASH_REDIS_PORT, UPSTASH_REDIS_USERNAME, UPSTASH_REDIS_PASSWORD } = process.env;
