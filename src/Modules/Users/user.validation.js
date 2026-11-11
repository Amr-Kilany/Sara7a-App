import joi from "joi";
import { Types } from "mongoose";

export const updatePasswordSchema = {
  body: joi.object({
    oldPassword: joi.string().min(6).max(100).required(),
    newPassword: joi.string().min(6).max(100).required(),

    confirmPassword: joi.string().valid(joi.ref("newPassword")).required().messages({
      "any.only": "Passwords do not match",
    }),
  }),
};

export const freezeSchema = {
  params: joi.object({
    userId: joi.string().custom((value, helper) => {
      return Types.ObjectId.isValid(value) || helper.message("Invalid ObjectId format");
    }),
  }),
};

export const restoreSchema = {
  params: joi.object({
    userId: joi.string().custom((value, helper) => {
      return Types.ObjectId.isValid(value) || helper.message("Invalid ObjectId format");
    }),
  }),
};

export const hardDeleteSchema = {
  params: joi.object({
    userId: joi.string().custom((value, helper) => {
      return Types.ObjectId.isValid(value) || helper.message("Invalid ObjectId format");
    }),
  }),
};
