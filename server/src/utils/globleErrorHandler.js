import { ApiError } from "./ApiError.js";
import { ApiResponse } from "./ApiResponse.js";

// 🔹 Global Error Middleware
const globalErrorHandler = (err, req, res, next) => {
  // If error is not an instance of ApiError, create a generic one
  if (!(err instanceof ApiError)) {
    console.log(err);
    err = new ApiError(err?.status || 500, err.message);
  }

  // 🔹 Standardized API Response
  const response = new ApiResponse(err.statusCode, null, err.message);
  console.log(response);
  return res.status(err.statusCode).json(response);
};

export default globalErrorHandler;