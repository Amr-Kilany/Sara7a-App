export const errorResponse = ({ message = "An error occurred", status = 400, extra = undefined }) => {
  const error = new Error(typeof message === "string" ? message : message?.message || "An error occurred");

  error.status = status;
  error.extra = extra;
  throw error;
};

export const badRequestException = (message = "Bad Request", extra = undefined) => {
  errorResponse({ message, status: 400, extra });
};

export const conflictException = (message = "Conflict", extra = undefined) => {
  errorResponse({ message, status: 409, extra });
};

export const notFoundException = (message = "Not Found", extra = undefined) => {
  errorResponse({ message, status: 404, extra });
};

export const unauthorizedException = (message = "Unauthorized", extra = undefined) => {
  errorResponse({ message, status: 401, extra });
};

export const forbiddenException = (message = "Forbidden", extra = undefined) => {
  errorResponse({ message, status: 403, extra });
};

export const tooManyRequestsException = (message = "Too Many Requests", extra = undefined) => {
  errorResponse({ message, status: 429, extra });
};

export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;
  return res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: err.stack || undefined,
    statusCode,
    extra: err.extra || undefined,
  });
};
