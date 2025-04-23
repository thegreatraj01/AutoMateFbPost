import { ApiResponse } from "./ApiResponse.js";

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => {
      if (process.env.NODE_ENV === "development") {
        console.log("❌ Error:", err);
      }

      const statusCode = err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      const response = new ApiResponse(statusCode, null, message);
      res.status(statusCode).json(response);
    });
  };
};

export { asyncHandler };
