class ApiError extends Error {
    constructor(
      statusCode = 500,
      message = "Something went wrong",
      errors = [],
      stack = ""
    ) {
      super(message);
      this.name = this.constructor.name;
      this.statusCode = statusCode;
      this.data = null;
      this.message = message;
      this.success = false;
      this.errors = errors;
  
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  
    toJSON() {
      return {
        statusCode: this.statusCode,
        message: this.message,
        success: this.success,
        errors: this.errors,
        stack: this.stack,
      };
    }
  }
  
  export { ApiError };
  