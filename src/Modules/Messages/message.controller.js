import { Router } from "express";
import { validation } from "../../Middlewares/validation.middleware.js";
import * as messageService from "./message.service.js";
import * as messageValidation from "./message.validation.js";
import { authentication } from "../../Middlewares/authentication.middleware.js";
import { TokenTypeEnum } from "../../Utils/enums/user.enum.js";
const router = Router();

router.post("/send-message/:receiverId", validation(messageValidation.sendMessageSchema), messageService.sendMessage);

router.get("/", authentication({ tokenType: TokenTypeEnum.Access }), messageService.getMessages);

router.patch(
  "/:messageId/read-status",
  authentication({ tokenType: TokenTypeEnum.Access }),
  validation(messageValidation.toggleReadStatusSchema),
  messageService.toggleReadStatus,
);

router.patch(
  "/:messageId/favorite",
  authentication({ tokenType: TokenTypeEnum.Access }),
  validation(messageValidation.toggleFavoriteSchema),
  messageService.toggleFavorite,
);

export default router;
