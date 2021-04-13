"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transferHistoryReq = void 0;
const joi_1 = __importDefault(require("@hapi/joi"));
// define the validation schema
exports.transferHistoryReq = joi_1.default.object().keys({
    accountNo: joi_1.default.string().required(),
    days: joi_1.default.number().required(),
    hash: joi_1.default.string()
});
//# sourceMappingURL=transfer-history-req.js.map