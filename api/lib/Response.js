const Enum = require("../models/enums");
const config = require("../config/config");
const CustomError = require("./Error"); 

class Response {
    constructor() { }

    static successResponse(data, code = 200) {
        return {
            code,
            data
        }
    }

    static errorResponse(error) {
        console.error(error);
        if (error instanceof CustomError) {
            return {
                code: error.code,
                error: {
                    message: error.message,
                    description: error.description
                }
            }
        } else if (error.message.includes("E11000")) {
            return {
                code: Enum.HTTP_CODES.CONFLICT,
                error: {
                    message: "ALREADY_EXIST",
                    description: "ALREADY_EXIST"
                }
            }
        }

        return {
            code: Enum.HTTP_CODES.INT_SERVER_ERROR,
            error: {
                message: "COMMON.UNKNOWN_ERROR",
                description: error.message
            }
        }
    }

}

module.exports = Response;