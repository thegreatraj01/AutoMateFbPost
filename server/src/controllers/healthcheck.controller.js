import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { HTTP_STATUS_CODES } from "../utils/HttpStatusCode.js";

// DONE :
const healthcheck = asyncHandler(async (req, res) => {
    setTimeout(() => {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    HTTP_STATUS_CODES.OK.code,
                    { status: "OK" },
                    "Healthcheck passed successfully"
                )
            );
    }, 5000);
});

export { healthcheck };