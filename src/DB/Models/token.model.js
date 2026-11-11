import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    expiresIn: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// TTL index
// MongoDB automatically removes the document
// when expiresIn is reached.

tokenSchema.index(
  { expiresIn: 1 },
  {
    expireAfterSeconds: 0,
  },
);

const TokenModel = mongoose.model("Token", tokenSchema);

export default TokenModel;
