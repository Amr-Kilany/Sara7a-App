import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "content is required"],
      minlength: [1, "Message must be at least 1 characters long"],
      maxlength: [500, "Message cannot exceed 500 characters"],
      trim: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
  },
);

messageSchema.index({ receiverId: 1 });

const MessageModel = mongoose.models.Message || mongoose.model("Message", messageSchema);

export default MessageModel;
