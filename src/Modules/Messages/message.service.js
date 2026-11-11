import { create, findOne } from "../../DB/database.repository.js";
import { notFoundException } from "../../Utils/response/error.response.js";
import UserModel from "../../DB/Models/user.model.js";
import MessageModel from "../../DB/Models/message.model.js";
import { successResponse } from "./../../Utils/response/success.response.js";
import { findById } from "./../../DB/database.repository.js";

export const sendMessage = async (req, res) => {
  const { receiverId } = req.params;
  const { content } = req.body;

  const receiver = await findOne({
    model: UserModel,
    filter: { _id: receiverId, freezedAt: { $exists: false } },
  });
  if (!receiver) throw notFoundException("Receiver not found or account is frozen");

  const message = await create({
    model: MessageModel,
    data: [
      {
        content,
        receiverId,
      },
    ],
  });

  successResponse({
    res,
    message: "Message sent successfully",
    statusCode: 201,
    data: { message },
  });
};

export const getMessages = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const receiverId = req.user._id;
  const skip = (page - 1) * limit;

  const [messages, totalMessages] = await Promise.all([
    MessageModel.find({ receiverId }).sort({ createdAt: -1 }).skip(Number(skip)).limit(Number(limit)),
    MessageModel.countDocuments({ receiverId }),
  ]);

  successResponse({
    res,
    message: "Messages retrieved successfully",
    statusCode: 200,
    data: {
      messages,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
      },
    },
  });
};

export const toggleReadStatus = async (req, res) => {
  const { messageId } = req.params;
  const { receiverId } = req.user._id;

  const message = await findById({
    model: MessageModel,
    id: messageId,
  });

  if (!message) throw notFoundException("Message not found");
  if (message.receiverId.toString() !== receiverId.toString())
    throw notFoundException("You are not authorized to update this message");

  message.isRead = !message.isRead;
  await message.save();

  successResponse({
    res,
    message: `Message marked as ${message.isRead ? "read" : "unread"} successfully`,
    statusCode: 200,
    data: {
      updatedMessage: message,
    },
  });
};

export const toggleFavorite = async (req, res) => {
  const { messageId } = req.params;
  const { receiverId } = req.user._id;

  const message = await findById({
    model: MessageModel,
    id: messageId,
  });

  if (!message) throw notFoundException("Message not found");
  if (message.receiverId.toString() !== receiverId.toString())
    throw notFoundException("You are not authorized to update this message");

  message.isFavorite = !message.isFavorite;
  await message.save();

  successResponse({
    res,
    message: `Message marked as ${message.isFavorite ? "favorite" : "not favorite"} successfully`,
    statusCode: 200,
    data: {
      updatedMessage: message,
    },
  });
};
