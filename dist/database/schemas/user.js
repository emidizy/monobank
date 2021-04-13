"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user_schema = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class user_schema {
    constructor() {
        this.initCollection();
        this.initDBHook();
    }
    initDBHook() {
        // Mongoose hook. This is executed before a userSchema is created and saved
        this.user_schema.pre('save', function (next) {
            const user = this;
            const password = user.get('password', String);
            bcryptjs_1.default.hash(password, 10, (error, encrypted) => {
                user.set('password', encrypted);
                next();
            });
        });
    }
    initCollection() {
        this.user_schema = new mongoose_1.default.Schema({
            firstname: {
                type: String,
                required: [true, 'Please provide your first name']
            },
            lastname: {
                type: String,
                required: [true, 'Please provide your last name']
            },
            phone: {
                type: String,
                required: [true, 'Please provide your phone']
            },
            email: {
                type: String,
                required: [true, 'Please provide your Email'],
                unique: [true, 'User already registered']
            },
            password: {
                type: String,
                required: [true, 'Please provide your Password']
            },
            pin: {
                type: String,
                required: [false]
            },
            signupDate: {
                type: Date,
                default: Date.now
            },
            bvn: {
                type: String,
                required: [false],
                default: null
            },
            address: {
                type: String,
                required: [false],
                default: null
            },
            country: {
                type: String,
                required: [false],
                default: null
            },
            dp: {
                type: String,
                required: [false],
                default: null
            },
            notificationId: {
                type: String,
                required: [false],
                default: null
            },
            hasPin: {
                type: Boolean,
                required: [true, 'Specify value for hasPin parameter']
            },
            hasBankAccount: {
                type: Boolean,
                required: [true, 'Specify value for hasAccount parameter'],
                default: false
            },
            isActive: {
                type: Boolean,
                required: [true],
                default: true
            },
            lastLoginDate: {
                type: Date,
                default: Date.now
            },
            appVersion: {
                type: String,
                required: [false],
                default: null
            },
            bankAccountInfo: [{
                    accountId: {
                        type: String,
                        required: [false],
                        default: null
                    },
                    accountNumber: {
                        type: String,
                        required: [false],
                        unique: true
                    },
                    currency: {
                        type: String,
                        required: [false],
                        default: null
                    },
                    balance: {
                        type: Number,
                        required: [true],
                        default: 0.0
                    },
                    lien: {
                        type: Number,
                        required: [false],
                        default: 0.0
                    },
                    createdAt: {
                        type: Date,
                        default: null
                    }
                }],
            kyc: {
                level: {
                    type: String,
                    required: [true, 'provide value for KYC Level'],
                    default: '1'
                },
                gender: {
                    type: String,
                    required: [false],
                    default: null
                },
                isWatchlisted: {
                    type: Boolean,
                    required: [false],
                    default: false
                },
                isVerifiedLevel: {
                    type: Boolean,
                    required: [false],
                    default: true
                },
                docs: [{
                        type: {
                            type: String,
                            required: [false],
                            default: null
                        },
                        id: {
                            type: String,
                            required: [false],
                            default: null
                        },
                        data: {
                            type: String,
                            required: [false],
                            default: null
                        }
                    }],
            }
        });
        this.users = mongoose_1.default.model('users', this.user_schema);
    }
}
exports.user_schema = user_schema;
exports.default = new user_schema().users;
//# sourceMappingURL=user.js.map