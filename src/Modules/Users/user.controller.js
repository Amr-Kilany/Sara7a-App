import { Router } from "express";
import * as userService from "./user.service.js";
import { authentication, authorization } from "../../Middlewares/authentication.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../Utils/enums/user.enum.js";
import { fileValidation, localFileUpload } from "../../Utils/multer/local.multer.js";
import { validateMagicBytes } from "../../Middlewares/fileValidation.middleware.js";
import { validation } from "../../Middlewares/validation.middleware.js";
import * as userValidation from "./user.validation.js";

const router = Router();

router.get(
  "/profile",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.Admin, RoleEnum.User] }),
  userService.getProfile,
);

router.patch(
  "/upload-file",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.ADMIN, RoleEnum.USER] }),
  localFileUpload({ customPath: "users" }).single("attachment"),
  validateMagicBytes([
    ...fileValidation.documents,
    ...fileValidation.images,
    ...fileValidation.videos,
    ...fileValidation.audios,
  ]),
  userService.updateProfilePic,
);

router.patch(
  "/upload-cover-images",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.ADMIN, RoleEnum.USER] }),
  localFileUpload({ customPath: "users" }).array("attachment", 5),
  validateMagicBytes(fileValidation.images),
  userService.updateCoverPictures,
);

router.patch(
  "/update-password",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.ADMIN, RoleEnum.USER] }),
  validation(userValidation.updatePasswordSchema),
  userService.updatePassword,
);

router.patch(
  "{/:userId}/freeze-account",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.ADMIN, RoleEnum.USER] }),
  validation(userValidation.freezeSchema),
  userService.freezeAccount,
);

router.patch(
  "{/:userId}/restore-account",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.ADMIN, RoleEnum.USER] }),
  validation(userValidation.restoreSchema),
  userService.restoreAccount,
);

router.patch(
  "/:userId/hard-delete-account",
  authentication({ tokenType: TokenTypeEnum.Access }),
  authorization({ accessRoles: [RoleEnum.ADMIN] }),
  validation(userValidation.hardDeleteSchema),
  userService.hardDelete,
);

export default router;
