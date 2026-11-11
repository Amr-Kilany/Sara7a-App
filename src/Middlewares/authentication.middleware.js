import { findById, findOne } from "../DB/database.repository.js";

import TokenModel from "../DB/Models/token.model.js";
import UserModel from "../DB/Models/user.model.js";

import { get, revokeTokenKey } from "../DB/redis.service.js";

import { signatureEnum, TokenTypeEnum } from "../Utils/enums/user.enum.js";

import {
  notFoundException,
  unauthorizedException,
  badRequestException,
  forbiddenException,
} from "../Utils/response/error.response.js";

import { getSignature, verifyToken } from "../Utils/tokens/token.js";

/*
|--------------------------------------------------------------------------
| Decode & Validate Token
|--------------------------------------------------------------------------
*/

export const decodedToken = async ({ authorization, tokenType = TokenTypeEnum.Access }) => {
  // 1. Check Authorization header
  if (!authorization) {
    throw unauthorizedException("Authorization header is required");
  }

  /*
  Example:

  Authorization: USER eyJhbGciOiJIUzI1Ni...
  */

  const [Bearer, token] = authorization.split(" ");

  if (!Bearer || !token) {
    throw badRequestException("Invalid token format");
  }

  // 2. Determine signature level
  const signatureLevel = Bearer === "ADMIN" ? signatureEnum.Admin : Bearer === "USER" ? signatureEnum.User : null;

  if (signatureLevel === null) {
    throw unauthorizedException("Invalid Bearer key prefix");
  }

  // 3. Get token signatures
  const signature = getSignature({
    signatureLevel,
  });

  // 4. Verify JWT
  const decoded = verifyToken({
    token,
    secretKey: tokenType === TokenTypeEnum.Access ? signature.accessSignature : signature.refreshSignature,
  });

  // 5. Check if token was revoked in MongoDB
  const revokedToken = await findOne({
    model: TokenModel,
    filter: {
      jti: decoded.jti,
    },
  });

  if (revokedToken) {
    throw unauthorizedException("Token has been revoked");
  }

  // 6. Check if token was revoked in Redis
  const redisKey = revokeTokenKey({
    userId: decoded.id,
    jti: decoded.jti,
  });

  const isRevoked = await get({
    key: redisKey,
  });

  if (isRevoked) {
    throw unauthorizedException("Token is revoked");
  }

  // 7. Find user
  const user = await findById({
    model: UserModel,
    id: decoded.id,
  });

  if (!user) {
    throw notFoundException("User not found");
  }

  // 8. Check if user's credentials were changed
  //
  // If credentials were changed AFTER
  // this token was created,
  // this token is no longer valid.

  if ((user.changeCredentialsTime?.getTime() || 0) > decoded.iat * 1000) {
    throw unauthorizedException("Token has been revoked due to credential change");
  }

  // 9. Return user + decoded token
  return {
    user,
    decoded,
  };
};

/*
|--------------------------------------------------------------------------
| Authentication Middleware
|--------------------------------------------------------------------------
*/

export const authentication = ({ tokenType = TokenTypeEnum.Access } = {}) => {
  return async (req, res, next) => {
    const { user, decoded } = await decodedToken({
      authorization: req.headers.authorization,
      tokenType,
    });

    req.user = user;
    req.decoded = decoded;

    return next();
  };
};

/*
|--------------------------------------------------------------------------
| Authorization Middleware
|--------------------------------------------------------------------------
*/

export const authorization = ({ accessRoles = [] }) => {
  return async (req, res, next) => {
    if (!accessRoles.includes(req.user.role)) {
      throw forbiddenException("Unauthorized access");
    }

    return next();
  };
};
