// Contains standardized HTTP status codes used in API responses.
export const HTTP_STATUS_CODES = {
    // Informational responses (100–199)
    CONTINUE: { code: 100, message: "Request received, continue processing." },
    SWITCHING_PROTOCOLS: {
      code: 101,
      message: "Switching to new protocol as requested.",
    },
    PROCESSING: { code: 102, message: "Processing the request." },
  
    // Successful responses (200–299)
    OK: { code: 200, message: "Request succeeded." },
    CREATED: { code: 201, message: "Resource created successfully." },
    ACCEPTED: { code: 202, message: "Request accepted, processing pending." },
    NO_CONTENT: { code: 204, message: "Request succeeded, no content returned." },
  
    // Redirection messages (300–399)
    MOVED_PERMANENTLY: { code: 301, message: "Resource moved permanently." },
    FOUND: {
      code: 302,
      message: "Resource found, temporarily at a different URI.",
    },
    NOT_MODIFIED: {
      code: 304,
      message: "Resource not modified since last request.",
    },
    TEMPORARY_REDIRECT: {
      code: 307,
      message: "Temporary redirect, use original request method.",
    },
    PERMANENT_REDIRECT: {
      code: 308,
      message: "Permanent redirect, use original request method.",
    },
  
    // Client error responses (400–499)
    BAD_REQUEST: { code: 400, message: "Invalid request syntax." },
    UNAUTHORIZED: { code: 401, message: "Authentication required." },
    FORBIDDEN: { code: 403, message: "Access to the resource is forbidden." },
    NOT_FOUND: { code: 404, message: "Requested resource not found." },
    METHOD_NOT_ALLOWED: {
      code: 405,
      message: "HTTP method not allowed for this resource.",
    },
    CONFLICT: {
      code: 409,
      message: "Request conflict with the current state of the resource.",
    },
    UNPROCESSABLE_ENTITY: {
      code: 422,
      message: "Request is well-formed but cannot be processed.",
    },
  
    // Server error responses (500–599)
    INTERNAL_SERVER_ERROR: {
      code: 500,
      message: "Server encountered an internal error.",
    },
    NOT_IMPLEMENTED: {
      code: 501,
      message: "Server does not support the request method.",
    },
    BAD_GATEWAY: { code: 502, message: "Invalid response from upstream server." },
    SERVICE_UNAVAILABLE: {
      code: 503,
      message: "Service temporarily unavailable.",
    },
    GATEWAY_TIMEOUT: {
      code: 504,
      message: "Upstream server did not respond in time.",
    },
  };
  
  
  