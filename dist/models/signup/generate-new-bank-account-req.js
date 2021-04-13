"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateNewBankAccountReq = void 0;
const joi_1 = __importDefault(require("@hapi/joi"));
// define the validation schema
exports.generateNewBankAccountReq = joi_1.default.object().keys({
    // phone is required
    // and must be a string of the format +234XXXXXXXXXX
    // where X is a digit (0-9)
    phone: joi_1.default.string().regex(/(\+)\d{13}$/).required()
});
//# sourceMappingURL=generate-new-bank-account-req.js.map