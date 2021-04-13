"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUserReq = void 0;
const joi_1 = __importDefault(require("@hapi/joi"));
// define the validation schema
exports.searchUserReq = joi_1.default.object().keys({
    // userId is required
    // and must be a string of the format +234XXXXXXXXXX
    // where X is a digit (0-9)
    userId: joi_1.default.string().regex(/(\+)\d{13}$/).required(),
    nameToSearch: joi_1.default.string().allow(''),
    phoneToSearch: joi_1.default.string().allow('').regex(/(\+)\d{13}$/),
    searchByPhone: joi_1.default.boolean().required()
});
//# sourceMappingURL=search-user-req.js.map