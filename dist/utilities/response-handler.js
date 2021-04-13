"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const response_codes_1 = require("../models/response-codes");
const shortid_1 = __importDefault(require("shortid"));
class ResponseHandler {
    generateUniqueId() {
        let randomInt = Math.ceil(Math.random() * 999);
        return shortid_1.default.generate() + randomInt.toString();
    }
    commitResponse(requestId, responseCode, message, extras = null) {
        return {
            requestId: requestId,
            code: responseCode,
            message: message,
            data: extras
        };
    }
    handleException(requestId, message = null, extras = null) {
        return {
            requestId: requestId,
            code: response_codes_1.ResponseCodes.ERROR,
            message: message ? message : 'An unexpected error occoured while processing your request. kindly retry in a moment',
            data: extras
        };
    }
}
exports.default = new ResponseHandler();
//# sourceMappingURL=response-handler.js.map