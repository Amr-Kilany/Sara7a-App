import { tooManyRequestsException } from "../Utils/response/error.response.js";

const ipRequest = {};

const blockedIps = new Set();

const unBlockersTimers = new Map();

const RATE_LIMIT = 10;
const WINDOW_MS = 15 * 60 * 1000;

export const customRateLimiter = () => {
  return (req, res, next) => {
    const ip = req.ip;

    const currentTime = Date.now();

    if (blockedIps.has(ip)) throw tooManyRequestsException("Too many requests, please try again later.");

    if (!ipRequest[ip]) {
      ipRequest[ip] = {
        count: 1,
        startTime: currentTime,
      };
      return next();
    }

    const diff = currentTime - ipRequest[ip].startTime;

    if (diff < WINDOW_MS) {
      ipRequest[ip].count++;

      if (ipRequest[ip].count > RATE_LIMIT) {
        blockedIps.add(ip);

        if (!unBlockersTimers.has(ip)) {
          const timer = setTimeout(() => {
            blockedIps.delete(ip);
            unBlockersTimers.delete(ip);
          }, WINDOW_MS);
          unBlockersTimers.set(ip, timer);
        }

        throw tooManyRequestsException("Too many requests, please try again later.");
      }
    } else {
      ipRequest[ip] = {
        count: 1,
        startTime: currentTime,
      };
    }
    next();
  };
};
