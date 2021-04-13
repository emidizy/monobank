"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Converter {
    convertTo2dp(value) {
        return Math.round(((value) + Number.EPSILON) * 100) / 100;
    }
}
exports.default = new Converter();
//# sourceMappingURL=converter.js.map