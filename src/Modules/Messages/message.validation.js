import joi from "joi";
import { Types } from "mongoose";

export const sendMessageSchema = {
  body: joi.object({
    content: joi.string().min(1).max(500).required().messages({
      "string.min": "Message content must be at least 1 character long",
      "string.max": "Message content must be at most 500 characters long",
      "any.required": "Message content is required",
    }),
  }),
  params: joi.object({
    receiverId: joi.string().custom((value, helper) => {
      return Types.ObjectId.isValid(value) || helper.message("Invalid ObjectId format");
    }),
  }),
};

export const toggleReadStatusSchema = {
  params: joi.object({
    messageId: joi.string().custom((value, helper) => {
      return Types.ObjectId.isValid(value) || helper.message("Invalid ObjectId format");
    }),
  }),
};

export const toggleFavoriteSchema = {
  params: joi.object({
    messageId: joi.string().custom((value, helper) => {
      return Types.ObjectId.isValid(value) || helper.message("Invalid ObjectId format");
    }),
  }),
};
