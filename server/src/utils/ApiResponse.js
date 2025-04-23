class ApiResponse {
    constructor(statusCode, data, message = "Success") {
      this.statusCode = statusCode;
      this.data = data;
      this.message = message;
      this.success = statusCode < 400;
    }
  
    toJSON() {
      return {
        statusCode: this.statusCode,
        success: this.success,
        message: this.message,
        data: this.data,
      };
    }
  }
  
  export { ApiResponse };
  