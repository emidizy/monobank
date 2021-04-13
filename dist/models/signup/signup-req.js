"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupReq = void 0;
const joi_1 = __importDefault(require("@hapi/joi"));
// define the validation schema
exports.signupReq = joi_1.default.object().keys({
    // email is required
    // email must be a valid email string
    firstname: joi_1.default.string().required(),
    // email is required
    // email must be a valid email string
    lastname: joi_1.default.string().required(),
    // email is required
    // email must be a valid email string
    email: joi_1.default.string().email().required(),
    // phone is required
    // and must be a string of the format +234XXXXXXXXXX
    // where X is a digit (0-9)
    phone: joi_1.default.string().regex(/(\+)\d{13}$/).required(),
    dob: joi_1.default.string().min(8).required(),
    password: joi_1.default.string().min(6).required(),
    pin: joi_1.default.string().min(4).required(),
    depositAmount: joi_1.default.number().min(0).required(),
    country: joi_1.default.string().max(4).required(),
    notificationId: joi_1.default.string()
});
//# sourceMappingURL=signup-req.js.map