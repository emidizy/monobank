"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const request_logger_1 = require("../../interceptors/request-logger");
const config_1 = require("../../config");
const africastalking = require('africastalking')({
    apiKey: '145cc19323bdcbf7287a70452731f6880500ac5f9b2ecced1bbc0b27a7f4b642',
    username: 'sandbox',
});
class NotificationService {
    sendEmail(emailReq) {
        return __awaiter(this, void 0, void 0, function* () {
            let testAccount = yield nodemailer_1.default.createTestAccount();
            const smtpConfig = config_1.Config.SMTPClient;
            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer_1.default.createTransport({
                host: "in-v3.mailjet.com",
                //service: 'gmail.com',
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: smtpConfig.username,
                    pass: smtpConfig.password //testAccount.pass, // generated ethereal password
                }
            });
            let recipients = "";
            for (let user of emailReq.recipent) {
                if (recipients.length == 0) {
                    recipients = `${user}`;
                }
                else {
                    recipients = `${recipients}, ${user}`;
                }
            }
            console.log(recipients);
            // send mail with defined transport object
            yield transporter.sendMail({
                from: smtpConfig.sender,
                to: recipients,
                subject: emailReq.subject,
                text: !emailReq.isHtmlBody ? emailReq.body : null,
                html: emailReq.isHtmlBody ? emailReq.body : null
            })
                .then(response => {
                emailReq['status'] = 'success';
                emailReq['clientResponse'] = response;
                emailReq.body = '<Removed for Brevity>';
                request_logger_1.logActivity(emailReq.requestId.toString(), 'mailClient : sendEmail', emailReq);
            })
                .catch(err => {
                emailReq['status'] = 'failed';
                emailReq['clientResponse'] = err;
                emailReq.body = '<Removed for Brevity>';
                request_logger_1.logActivity(emailReq.requestId.toString(), 'mailClient : sendEmail', emailReq);
            });
        });
    }
}
exports.default = new NotificationService();
//# sourceMappingURL=notification-service.js.map