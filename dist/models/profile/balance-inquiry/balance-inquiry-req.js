"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.balanceInquiryReq = void 0;
const joi_1 = __importDefault(require("@hapi/joi"));
// define the validation schema
exports.balanceInquiryReq = joi_1.default.object().keys({
    // userId is required
    userId: joi_1.default.string().required(),
    accountNumber: joi_1.default.string().length(10)
});
//# sourceMappingURL=balance-inquiry-req.js.map