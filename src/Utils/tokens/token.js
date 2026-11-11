import jwt from "jsonwebtoken";

import {
  ACCESS_TOKEN_USER_SECRET,
  REFRESH_TOKEN_USER_SECRET,
  ACCESS_TOKEN_USER_EXPIRATION,
  ACCESS_TOKEN_ADMIN_SECRET,
  REFRESH_TOKEN_ADMIN_SECRET,
  ACCESS_TOKEN_ADMIN_EXPIRATION,
  REFRESH_TOKEN_USER_EXPIRATION,
  REFRESH_TOKEN_ADMIN_EXPIRATION,
} from "../../../config/config.service.js";

import { signatureEnum, RoleEnum } from "../enums/user.enum.js";

import { v4 as uuidv4 } from "uuid";

export const generateToken = ({ payload, secretKey, options } = {}) => {
  return jwt.sign(payload, secretKey, options);
};

export const verifyToken = ({ token, secretKey }) => {
  return jwt.verify(token, secretKey);
};

export const getSignature = ({ signatureLevel = signatureEnum.User }) => {
  let signature = {
    accessSignature: undefined,
    refreshSignature: undefined,
  };

  switch (signatureLevel) {
    case signatureEnum.User:
      signature.accessSignature = ACCESS_TOKEN_USER_SECRET;

      signature.refreshSignature = REFRESH_TOKEN_USER_SECRET;

      break;

    case signatureEnum.Admin:
      signature.accessSignature = ACCESS_TOKEN_ADMIN_SECRET;

      signature.refreshSignature = REFRESH_TOKEN_ADMIN_SECRET;

      break;

    default:
      throw new Error("Invalid signature level");
  }

  return signature;
};

export const getNewLoginCredentials = async (user) => {
  const signature = getSignature({
    signatureLevel: user.role !== RoleEnum.ADMIN ? signatureEnum.User : signatureEnum.Admin,
  });

  const jti = uuidv4();

  const isAdmin = user.role === RoleEnum.ADMIN;

  const accessToken = generateToken({
    payload: {
      id: user._id,
      role: user.role,
      jti,
    },

    secretKey: signature.accessSignature,

    options: {
      expiresIn: isAdmin ? ACCESS_TOKEN_ADMIN_EXPIRATION : ACCESS_TOKEN_USER_EXPIRATION,
    },
  });

  const refreshToken = generateToken({
    payload: {
      id: user._id,
      role: user.role,
      jti,
    },

    secretKey: signature.refreshSignature,

    options: {
      expiresIn: isAdmin ? REFRESH_TOKEN_ADMIN_EXPIRATION : REFRESH_TOKEN_USER_EXPIRATION,
    },
  });

  return {
    accessToken,
    refreshToken,
  };
};
