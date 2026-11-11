import { Types } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../Utils/enums/user.enum.js";
import { badRequestException } from "../Utils/response/error.response.js";
import joi from "joi";

export const generalFieldsValidation = {
  firstName: joi.string().min(2).max(25).messages({
    "any.required": "First name is required",
    "string.empty": "First name cannot be empty",
    "string.min": "First name must be at least 2 characters long",
    "string.max": "First name cannot exceed 25 characters",
  }),
  lastName: joi.string().min(2).max(25).messages({
    "any.required": "Last name is required",
    "string.empty": "Last name cannot be empty",
    "string.min": "Last name must be at least 2 characters long",
    "string.max": "Last name cannot exceed 25 characters",
  }),
  username: joi.string().min(2).max(25).messages({
    "any.required": "Username is required",
    "string.empty": "Username cannot be empty",
    "string.min": "Username must be at least 2 characters long",
    "string.max": "Username cannot exceed 25 characters",
  }),
  email: joi
    .string()
    .email({
      minDomainSegments: 2,
      maxDomainSegments: 5,
      tlds: { allow: ["com", "net", "org", "edu"] },
    })
    .messages({
      "string.email": "Please provide a valid email address",
    }),
  password: joi.string().min(6).max(100),
  confirmPassword: joi.string().valid(joi.ref("password")).messages({
    "any.only": "Confirm password must match the password",
  }),
  age: joi.number().integer().min(0).max(120).messages({
    "number.base": "Age must be a number",
    "number.integer": "Age must be an integer",
    "number.min": "Age cannot be negative",
    "number.max": "Age cannot exceed 120",
  }),
  phone: joi
    .string()
    .pattern(/^(\+201|\+20|01)[0-9]{9}$/) // egyptian phone number pattern
    .optional(),
  id: joi
    .string()
    .custom((value, helpers) => {
      return Types.ObjectId.isValid(value) ? value : helpers.message("Invalid object ID format");
    })
    .messages({
      "any.custom": "Invalid object ID format",
    }),

  gender: joi
    .string()
    .valid(...Object.values(GenderEnum))
    .optional(),
  role: joi
    .string()
    .valid(...Object.values(RoleEnum))
    .optional(),
  provider: joi
    .string()
    .valid(...Object.values(ProviderEnum))
    .optional(),
  DOB: joi.string().isoDate().optional(),

  profilePicture: joi.string().optional(),
  coverPicture: joi.array().items(joi.string()).optional(),
};

export const validation = (schema) => {
  return (req, res, next) => {
    const validationErrors = [];

    for (const key of Object.keys(schema)) {
      const validationResult = schema[key].validate(req[key], {
        abortEarly: false,
      });

      if (validationResult.error) {
        validationErrors.push({
          key,
          details: validationResult.error.details,
        });
      }
    }

    if (validationErrors.length) {
      throw badRequestException("Invalid input data", validationErrors);
    }

    return next();
  };
};
