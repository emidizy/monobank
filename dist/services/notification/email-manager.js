"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notification_service_1 = __importDefault(require("./notification-service"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../../config");
const search_service_1 = __importDefault(require("../profile/search-service"));
const request_logger_1 = require("../../interceptors/request-logger");
const response_codes_1 = require("../../models/response-codes");
class EmailManager {
    sendWelcomeEmail(requestId, firstname, userEmail) {
        let content = this.getTemplate('../../../email-templates/mono-welcome.html');
        content = content.replace('{{username}}', firstname.toString());
        let emailReq = {
            requestId: requestId,
            subject: `Welcome to ${config_1.Config.AppName}!`,
            recipent: [userEmail.toString()],
            body: content,
            isHtmlBody: true
        };
        notification_service_1.default.sendEmail(emailReq)
            .then()
            .catch();
    }
    sendPaymentNotification(notifReq) {
        search_service_1.default.searchUserByAccountNumber(notifReq.requestId, notifReq.accountNo)
            .then(resp => {
            var _a, _b;
            if (resp.code == response_codes_1.ResponseCodes.SUCCESS) {
                const user = resp.data;
                notifReq.userEmail = user.email.toString();
                let content = this.getTemplate('../../../email-templates/mono-transaction.html');
                const maskedAccountNo = notifReq.accountNo.slice(9).padStart(notifReq.accountNo.length, '*');
                content = content.replace('{{title}}', notifReq.title);
                content = content.replace('{{accountNo}}', maskedAccountNo);
                content = content.replace('{{amount}}', notifReq.amount.toString());
                content = content.replace('{{convenienceFee}}', (_a = notifReq.convenienceFee) === null || _a === void 0 ? void 0 : _a.toString());
                content = content.replace('{{narration}}', notifReq.narration);
                content = content.replace('{{transactionRef}}', notifReq.tranId);
                content = content.replace('{{date}}', notifReq.date.toString());
                content = content.replace('{{balance}}', (_b = notifReq.balance) === null || _b === void 0 ? void 0 : _b.toString());
                let emailReq = {
                    requestId: notifReq.requestId,
                    subject: `Transaction Notification`,
                    recipent: [user.email.toString()],
                    body: content,
                    isHtmlBody: true
                };
                notification_service_1.default.sendEmail(emailReq)
                    .then()
                    .catch();
            }
            else {
                request_logger_1.logActivity(notifReq.requestId, 'sendPaymentNotification', resp);
            }
        })
            .catch(err => {
            request_logger_1.logActivity(notifReq.requestId, 'sendPaymentNotification', err);
        });
    }
    getTemplate(filePath) {
        const templatePath = path_1.default.join(__dirname, filePath);
        //console.log('path', templatePath);
        let content = fs_1.default.readFileSync(templatePath, { encoding: "utf-8" });
        return content;
    }
}
exports.default = new EmailManager();
//# sourceMappingURL=email-manager.js.map