"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bankNameInquiryReq = void 0;
const joi_1 = __importDefault(require("@hapi/joi"));
exports.bankNameInquiryReq = joi_1.default.object().keys({
    userId: joi_1.default.string().required(),
    accountNumber: joi_1.default.string().min(10).max(10).required()
});
//# sourceMappingURL=bank-name-inquiry-req.js.map