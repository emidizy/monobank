"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//Initialize express router 
const express = __importStar(require("express"));
const profile_controller_1 = __importDefault(require("../controllers/profile-controller"));
class ProfileRoutes {
    constructor() {
        this.routes = express.Router();
        this.initRoutes();
    }
    initRoutes() {
        this.routes.post('/search', profile_controller_1.default.searchUser);
        this.routes.get('/users/all', profile_controller_1.default.getAllUsers);
        this.routes.post('/inquiry/account/balance', profile_controller_1.default.getUserAccountBalance);
    }
}
exports.default = new ProfileRoutes();
//# sourceMappingURL=profile-routes.js.map