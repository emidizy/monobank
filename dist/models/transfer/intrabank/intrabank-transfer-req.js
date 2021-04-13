"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntraBankTransferReq = void 0;
const joi_1 = __importDefault(require("@hapi/joi"));
// define the validation schema
exports.IntraBankTransferReq = joi_1.default.object().keys({
    userId: joi_1.default.string().required(),
    sourceAccount: joi_1.default.string().max(10).required(),
    destinationAccount: joi_1.default.string().max(10).required(),
    recipientName: joi_1.default.string().max(100).required(),
    clientTranId: joi_1.default.string().max(60),
    narration: joi_1.default.string().max(100).required(),
    amount: joi_1.default.number().min(1).required(),
    pin: joi_1.default.string().required(),
    hash: joi_1.default.string()
});
//# sourceMappingURL=intrabank-transfer-req.js.map