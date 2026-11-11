import connectDB from "./DB/connection.js";
import { authRoutes, messageRoutes, userRoutes } from "./Modules/index.js";
import { globalErrorHandler, notFoundException } from "./Utils/response/error.response.js";
import { successResponse } from "./Utils/response/success.response.js";
import { sendEmail } from "./Utils/email/email.utils.js";

import path from "path";
import cors from "cors";
import { corsOptions } from "./Utils/cors/cors.utils.js";
import helmet from "helmet";
import morgan from "morgan";
import { attachRouterWithLogger } from "./Utils/loggers/morgan.logger.js";
import { rateLimit } from "express-rate-limit";
import { customRateLimiter } from "./Middlewares/rate-limit.middleware.js";
import { redisConnection } from "./DB/redis-connection.js";

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  limit: 3,
  legacyHeaders: false,
  // standardHeaders: "draft-8",
});

const bootstrap = async (app, express) => {
  app.use(express.json(), cors(corsOptions()), helmet(), morgan(), customRateLimiter()); //limiter);
  await connectDB();
  await redisConnection();

  // app.get("/", (req, res) => {
  //   successResponse({ res, statusCode: 201, message: "Welcome to the Sara7a API" });
  // });

  attachRouterWithLogger(app, "/api/v1/auth", authRoutes, "access.log");
  attachRouterWithLogger(app, "/api/v1/users", userRoutes, "access.log");

  app.use("/uploads", express.static(path.resolve("./src/uploads")));
  app.use("/api/v1/auth", authRoutes);
  app.use("/api/v1/messages", messageRoutes);
  app.use("/api/v1/users", userRoutes);

  app.all("/*dummy", (req, res) => {
    notFoundException("Route not found!!");
  });

  app.use(globalErrorHandler);
};

export default bootstrap;
