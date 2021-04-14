"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginReq = void 0;
const joi_1 = __importDefault(require("@hapi/joi"));
// define the validation schema
exports.loginReq = joi_1.default.object().keys({
    userId: joi_1.default.string().required(),
    password: joi_1.default.string().required(),
    appVersion: joi_1.default.string().optional()
});
//# sourceMappingURL=login-req.js.map