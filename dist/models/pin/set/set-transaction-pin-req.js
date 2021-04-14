"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setTransactionPinReq = void 0;
const joi_1 = __importDefault(require("@hapi/joi"));
// define the validation schema
exports.setTransactionPinReq = joi_1.default.object().keys({
    // phone is required
    // and must be a string of the format +234XXXXXXXXXX
    // where X is a digit (0-9)
    phone: joi_1.default.string().regex(/(\+)\d{13}$/).required(),
    password: joi_1.default.string().required(),
    pin: joi_1.default.string().length(4).required(),
});
//# sourceMappingURL=set-transaction-pin-req.js.map