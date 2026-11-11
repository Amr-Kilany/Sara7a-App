import joi from "joi";
import Types from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../Utils/enums/user.enum.js";
import { generalFieldsValidation } from "../../Middlewares/validation.middleware.js";

export const signupSchema = {
  body: joi.object({
    username: generalFieldsValidation.username.required(),
    email: generalFieldsValidation.email.required(),
    password: generalFieldsValidation.password.required(),
    confirmPassword: generalFieldsValidation.confirmPassword,
    phone: generalFieldsValidation.phone,
    gender: generalFieldsValidation.gender,
    role: generalFieldsValidation.role,
    provider: generalFieldsValidation.provider,
    DOB: generalFieldsValidation.DOB,

    profilePicture: generalFieldsValidation.profilePicture,
    coverPicture: generalFieldsValidation.coverPicture,
  }),
};

export const loginSchema = {
  body: joi.object({
    email: generalFieldsValidation.email.required(),
    password: generalFieldsValidation.password.required(),
  }),
};

// id: joi.string().custom((value, helpers) => {
//     Types.ObjectId.isValid(value) ? value : helpers.message("Invalid object ID format");
//   }),

export const confirmEmailSchema = {
  body: joi.object({
    email: joi
      .string()
      .email({ minDomainSegments: 2, maxDomainSegments: 5, tlds: { allow: ["com", "net", "org"] } })
      .required(),
    otp: joi
      .string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        "string.pattern.base": "OTP must be exactly 6 digits",
        "any.required": "OTP is required",
        "string.empty": "OTP cannot be empty",
      }),
  }),
};

export const forgetPasswordSchema = {
  body: joi.object({
    email: joi
      .string()
      .email({ minDomainSegments: 2, maxDomainSegments: 5, tlds: { allow: ["com", "net", "org"] } })
      .required(),
  }),
};

export const resetPasswordSchema = {
  body: joi.object({
    email: joi
      .string()
      .email({
        minDomainSegments: 2,
        maxDomainSegments: 5,
        tlds: { allow: ["com", "net", "org", "edu"] },
      })
      .required(),

    otp: joi
      .string()
      .pattern(/^\d{6}$/)
      .required()
      .messages({
        "string.pattern.base": "OTP must be exactly 6 digits",
        "any.required": "OTP is required",
        "string.empty": "OTP cannot be empty",
      }),

    newPassword: joi.string().min(6).max(100).required(),

    confirmPassword: joi.string().valid(joi.ref("newPassword")).required().messages({
      "any.only": "Passwords do not match",
    }),
  }),
};
