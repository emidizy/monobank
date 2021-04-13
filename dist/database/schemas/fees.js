"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
class fees_schema {
    constructor() {
        this.initCollection();
        this.createIndex();
    }
    createIndex() {
        if (!this.fees.schema.indexes()) {
            this.fees.schema.index({ '$**': 'text' });
            //console.log(TeamSchema.indexes())
        }
    }
    initCollection() {
        this.feeSchema = new mongoose_1.default.Schema({
            bankTransfer: [{
                    below5K: {
                        type: Number,
                        required: [true, 'Please provide value']
                    },
                    btwn5KAnd50K: {
                        type: Number,
                        required: [true, 'Please provide value']
                    },
                    above50K: {
                        type: Number,
                        required: [true, 'Please provide value']
                    },
                    defaultProviderFee: {
                        type: Number,
                        required: [true, 'Please provide value']
                    }
                }]
        });
        this.fees = mongoose_1.default.model('fees', this.feeSchema);
    }
}
exports.default = new fees_schema().fees;
//# sourceMappingURL=fees.js.map