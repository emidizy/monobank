"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTxChargeReq = void 0;
const joi_1 = __importDefault(require("@hapi/joi"));
// define the validation schema
exports.getTxChargeReq = joi_1.default.object().keys({
    userId: joi_1.default.string().required(),
    amount: joi_1.default.number().min(0).required(),
    transferType: joi_1.default.string().required()
});
//# sourceMappingURL=get-tx-charge-req.js.map