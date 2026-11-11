import mongoose from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../Utils/enums/user.enum.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minlength: [2, "First name must be at least 2 characters long"],
      maxlength: [25, "First name must be at most 25 characters long"],
    },

    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minlength: [2, "Last name must be at least 2 characters long"],
      maxlength: [25, "Last name must be at most 25 characters long"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },

    password: {
      type: String,

      required: function () {
        return this.provider === ProviderEnum.SYSTEM;
      },

      minlength: [6, "Password must be at least 6 characters long"],
    },

    DOB: Date,

    phone: String,

    gender: {
      type: Number,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },

    role: {
      type: Number,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },

    provider: {
      type: Number,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },

    confirmEmail: Date,

    confirmEmailOTP: String,

    confirmEmailOTPExpiresAt: {
      type: Date,
    },

    forgetPasswordOTP: String,

    profilePicture: String,

    coverPicture: [String],

    freezedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    freezedAt: Date,
    freezedByRole: { type: Number, enum: Object.values(RoleEnum) },

    restoredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    restoredAt: Date,

    isActive: {
      type: Boolean,
      default: true,
    },

    changeCredentialsTime: {
      type: Date,
    },
  },

  {
    timestamps: true,

    toObject: {
      virtuals: true,
    },

    toJSON: {
      virtuals: true,
    },
  },
);

// username virtual
userSchema
  .virtual("username")
  .set(function (value) {
    const [firstName, lastName] = value.split(" ") || [];

    this.set({
      firstName,
      lastName,
    });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;
