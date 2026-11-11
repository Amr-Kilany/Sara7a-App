import {
  ACCESS_TOKEN_ADMIN_EXPIRATION,
  ACCESS_TOKEN_USER_EXPIRATION,
  CLIENT_ID,
} from "../../../config/config.service.js";

import { findOne, createOne, create, updateOne, findOneAndUpdate } from "../../DB/database.repository.js";

import UserModel from "../../DB/Models/user.model.js";

import { HashEnum } from "../../Utils/enums/security.enum.js";

import {
  badRequestException,
  conflictException,
  notFoundException,
  unauthorizedException,
} from "../../Utils/response/error.response.js";

import { successResponse } from "../../Utils/response/success.response.js";

import { compareHash, genrateHash } from "../../Utils/security/hash.security.js";

import { encrypt } from "../../Utils/security/encryption.security.js";

import { getNewLoginCredentials } from "../../Utils/tokens/token.js";

import { OAuth2Client } from "google-auth-library";

import { LogoutTypeEnum, ProviderEnum } from "../../Utils/enums/user.enum.js";

import TokenModel from "../../DB/Models/token.model.js";
import { emailSubjects, sendEmail } from "../../Utils/email/email.utils.js";
import { generateOTP } from "../../Utils/generateOTP.utils.js";
import { emailEvents } from "../../Utils/events/email.events.js";
import { revokeTokenKey, set } from "../../DB/redis.service.js";

export const signup = async (req, res) => {
  const { username, email, password, phone } = req.body;

  // Check if user already exists
  if (
    await findOne({
      model: UserModel,
      filter: { email },
    })
  ) {
    throw conflictException("User already exists");
  }

  const otp = await generateOTP();
  const hashedOTP = await genrateHash({
    plainText: String(otp),
    algorithm: HashEnum.Argon2,
  });
  // Hash password
  const hashedPassword = await genrateHash({
    plainText: password,
    algorithm: HashEnum.Argon2,
  });

  // Encrypt phone
  const encryptedPhone = encrypt(phone);

  // Create user
  const user = await createOne({
    model: UserModel,
    data: {
      username,
      email,
      password: hashedPassword,
      phone: encryptedPhone,
      confirmEmailOTP: hashedOTP,
      confirmEmailOTPExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  // Send Email --> 2 Emit Event

  emailEvents.emit("ConfirmEmail", { to: email, otp });

  successResponse({
    res,
    statusCode: 201,
    message: "User created successfully",
    data: {
      user,
    },
  });
};

export const confirmEmail = async (req, res) => {
  const { email, otp } = req.body;

  // Find user
  const user = await findOne({
    model: UserModel,
    filter: {
      email,
      confirmEmailOTP: { $exists: true },
      confirmEmail: { $exists: false },
      confirmEmailOTPExpiresAt: { $gt: new Date() },
    },
  });

  if (!user) {
    throw notFoundException("User not found");
  }

  // Compare password
  const isMatch = await compareHash({
    plainText: otp,
    cipherText: user.confirmEmailOTP,
    algorithm: HashEnum.Argon2,
  });

  if (!isMatch) {
    throw badRequestException("Invalid OTP");
  }

  await updateOne({
    model: UserModel,
    filter: { email },
    update: {
      confirmEmail: Date.now(),
      $unset: {
        confirmEmailOTP: true,
        confirmEmailOTPExpiresAt: true,
      },
    },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "User Confirmed successfully",
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  // Find user
  const user = await findOne({
    model: UserModel,
    filter: { email, confirmEmail: { $exists: true } },
  });

  if (!user) {
    throw notFoundException("User not found");
  }

  // Compare password
  const isMatch = await compareHash({
    plainText: password,
    cipherText: user.password,
    algorithm: HashEnum.Argon2,
  });

  if (!isMatch) {
    throw badRequestException("Invalid credentials");
  }

  // Generate tokens
  const tokens = await getNewLoginCredentials(user);

  successResponse({
    res,
    statusCode: 200,
    message: "User logged in successfully",
    data: {
      tokens,
    },
  });
};

export const refreshToken = async (req, res) => {
  const tokens = await getNewLoginCredentials(req.user);

  successResponse({
    res,
    statusCode: 200,
    data: {
      tokens,
    },
    message: "Token refresh successfully",
  });
};

async function verifyGoogleAccount({ idToken }) {
  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience: CLIENT_ID,
  });

  const payload = ticket.getPayload();

  return payload;
}

export const loginWithGoogle = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return next(badRequestException("ID Token is required"));
    }

    const payload = await verifyGoogleAccount({
      idToken,
    });

    const { email, email_verified, given_name, family_name, name, picture } = payload;

    if (!email_verified) {
      return next(badRequestException("Email not verified by Google!"));
    }

    const firstName = given_name || name?.split(" ")[0] || "Google";

    const lastName = family_name || name?.split(" ").slice(1).join(" ") || "User";

    const user = await findOne({
      model: UserModel,
      filter: { email },
    });

    // Existing Google user
    if (user) {
      if (user.provider !== ProviderEnum.GOOGLE) {
        return next(conflictException("User exists with a different login provider"));
      }

      const credentials = await getNewLoginCredentials(user);

      return successResponse({
        res,
        message: "Login successfully",
        data: {
          credentials,
        },
        statusCode: 200,
      });
    }

    // Create new Google user
    const newUser = await createOne({
      model: UserModel,
      data: {
        firstName,
        lastName,
        email,
        profilePicture: picture,
        provider: ProviderEnum.GOOGLE,
      },
    });

    const credentials = await getNewLoginCredentials(newUser);

    return successResponse({
      res,
      message: "User registered and logged in successfully",
      data: {
        credentials,
      },
      statusCode: 201,
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  const { flag } = req.body || {};

  switch (flag) {
    // =========================================
    // Logout from current device
    // =========================================
    case LogoutTypeEnum.LogoutFromCurrentDevice: {
      await create({
        model: TokenModel,
        data: {
          jti: req.decoded.jti,
          userId: req.decoded.id,
          expiresIn: new Date(req.decoded.exp * 1000),
        },
      });

      break;
    }

    // =========================================
    // Logout from all devices
    // =========================================
    case LogoutTypeEnum.LogoutFromAllDevices: {
      await updateOne({
        model: UserModel,
        filter: {
          _id: req.decoded.id,
        },
        update: {
          changeCredentialsTime: new Date(),
        },
      });

      break;
    }

    default:
      throw badRequestException("Invalid logout flag");
  }

  return successResponse({
    res,
    statusCode: 200,
    message: "User logged out successfully",
  });
};

export const logoutWithRedis = async (req, res) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const ttl = req.decoded.exp - currentTime;

  if (ttl <= 0) {
    throw unauthorizedException("Token has already expired");
  }

  // Use req.decoded.id to remain consistent with authentication middleware
  const userId = req.decoded?.id || req.user?._id?.toString();

  await set({
    key: revokeTokenKey({
      userId,
      jti: req.decoded.jti,
    }),
    value: "revoked",
    ttl,
  });

  return successResponse({
    res,
    statusCode: 200,
    message: "User logged out successfully",
  });
};

export const forgetPassword = async (req, res) => {
  const { email } = req.body;

  const otp = generateOTP();

  const hashedOtp = await genrateHash({ plainText: String(otp), algorithm: HashEnum.Argon2 });

  const user = await findOneAndUpdate({
    model: UserModel,
    filter: { email, confirmEmail: { $exists: true }, provider: ProviderEnum.SYSTEM },
    update: { forgetPasswordOTP: hashedOtp },
  });

  if (!user) throw notFoundException("User Not Found");

  // Send Email otp
  emailEvents.emit("forgetPassword", { to: email, otp });

  successResponse({ res, message: "Chenk Your Inbox" });
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await findOne({
    model: UserModel,
    filter: {
      email,
      provider: ProviderEnum.SYSTEM,
      confirmEmail: { $exists: true },
      forgetPasswordOTP: { $exists: true },
    },
  });

  if (!user) {
    throw notFoundException("User Not Found");
  }

  const isValidOtp = await compareHash({
    plainText: String(otp),
    cipherText: user.forgetPasswordOTP,
    algorithm: HashEnum.Argon2,
  });

  if (!isValidOtp) {
    throw badRequestException("Invalid OTP");
  }

  const hashedNewPassword = await genrateHash({
    plainText: newPassword,
    algorithm: HashEnum.Argon2,
  });

  await updateOne({
    model: UserModel,
    filter: { email },
    update: {
      password: hashedNewPassword,
      $unset: {
        forgetPasswordOTP: true,
      },
    },
  });

  successResponse({
    res,
    message: "Password Reset Successfully",
  });
};
