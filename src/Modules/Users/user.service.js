import { deleteOne, findById, findByIdAndUpdate, findOneAndUpdate, updateOne } from "../../DB/database.repository.js";
import UserModel from "../../DB/models/user.model.js";
import { HashEnum } from "../../Utils/enums/security.enum.js";
import { ProviderEnum, RoleEnum } from "../../Utils/enums/user.enum.js";
import {
  badRequestException,
  forbiddenException,
  notFoundException,
  unauthorizedException,
} from "../../Utils/response/error.response.js";
import { successResponse } from "../../Utils/response/success.response.js";
import { decrypt } from "../../Utils/security/encryption.security.js";
import { compareHash, genrateHash } from "../../Utils/security/hash.security.js";

export const getProfile = async (req, res) => {
  const user = req.user.toObject();
  if (user.phone) {
    user.phone = decrypt(user.phone);
  }

  successResponse({
    res,
    statusCode: 200,
    message: "User profile fetched successfully",
    data: { user },
  });
};

export const updateProfilePic = async (req, res) => {
  const profilePicture = req.file?.finalPath || req.file?.path;

  const user = await findByIdAndUpdate({
    model: UserModel,
    id: req.user._id,
    update: { profilePicture },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Profile picture updated successfully",
    data: { user },
  });
};

export const updateCoverPictures = async (req, res) => {
  const coverPicture = req.files?.map((file) => file.finalPath || file.path);

  const user = await findByIdAndUpdate({
    model: UserModel,
    id: req.user._id,
    update: { coverPicture },
  });

  successResponse({
    res,
    statusCode: 200,
    message: "Cover pictures updated successfully",
    data: { user },
  });
};

export const updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { user } = req;

  if (user.provider !== ProviderEnum.SYSTEM || !user.password) {
    throw badRequestException("Password update is only available for local system accounts");
  }

  const isValidOldPassword = await compareHash({
    plainText: oldPassword,
    cipherText: user.password,
    algorithm: HashEnum.Argon2,
  });

  if (!isValidOldPassword) throw badRequestException("Invalid Credentials");

  const hashedPassword = await genrateHash({
    plainText: newPassword,
    algorithm: HashEnum.Argon2,
  });

  await updateOne({
    model: UserModel,
    filter: { _id: user._id },
    update: {
      password: hashedPassword,
      changeCredentialsTime: new Date(),
    },
  });

  successResponse({ res, message: "Password Updated Successfully!" });
};

export const freezeAccount = async (req, res) => {
  const { userId } = req.params;

  const targetUserId = userId || req.user._id;

  if (targetUserId.toString() !== req.user._id.toString() && req.user.role !== RoleEnum.ADMIN)
    throw unauthorizedException("You Are Not Authorized to freeze this account!");

  const updateUser = await findOneAndUpdate({
    model: UserModel,
    filter: { _id: targetUserId, freezedAt: { $exists: false } },
    update: { freezedBy: req.user._id, freezedByRole: req.user.role, freezedAt: new Date() },
    $unset: { restoredBy: true, restoredAt: true },
  });

  if (!updateUser) throw notFoundException("User Not Found or Account Already frozen!");

  successResponse({ res, message: "Frozen Successfully!", statusCode: 200, data: { updateUser } });
};

export const restoreAccount = async (req, res) => {
  const { userId } = req.params;

  const targetUserId = userId || req.user._id;

  const user = await findById({ model: UserModel, id: targetUserId });
  if (!user || !user.freezedAt) throw notFoundException("User Not Found or Account Is Not Frozen!");

  if (user.freezedByRole === RoleEnum.ADMIN) {
    if (req.user.role !== RoleEnum.ADMIN)
      throw forbiddenException("This account was frozen by an admin. Only admin can restore it!");
  } else {
    if (targetUserId.toString() !== req.user._id.toString() && req.user.role !== RoleEnum.ADMIN)
      throw forbiddenException("You are not authorized to restore this account");
  }

  const updatedUser = await findOneAndUpdate({
    model: UserModel,
    filter: { _id: targetUserId },
    update: {
      restoredAt: new Date(),
      restoredBy: req.user._id,
      $unset: { freezedAt: true, freezedBy: true, freezedByRole: true },
    },
  });

  successResponse({ res, message: "Restored Successfully!", statusCode: 200, data: { updatedUser } });
};

export const hardDelete = async (req, res) => {
  const { userId } = req.params;

  const results = await deleteOne({ model: UserModel, filter: { _id: userId } });

  if (!results.deletedCount) throw notFoundException("User Not Found");

  successResponse({ res, message: "User Deleted Successfully!", statusCode: 200 });
};
