import { ISendEmailReq } from "../../models/email/isend-email-req";
import notificationService from "./notification-service";
import fs from 'fs';
import path from 'path';
import { Config } from "../../config";
import { IPaymentNotificationReq } from "../../models/email/ipayment-notif-req";
import { ISearchAppUserResult } from "../../models/profile/search/isearch-user-result";
import searchService from "../profile/search-service";
import { logActivity } from "../../interceptors/request-logger";
import { ResponseCodes } from "../../models/response-codes";


class EmailManager {

    sendWelcomeEmail(requestId: string, firstname: String, userEmail: String){
  
        let content = this.getTemplate('../../../email-templates/mono-welcome.html');
        content = content.replace('{{username}}', firstname.toString());
      
        let emailReq: ISendEmailReq = {
            requestId: requestId,
            subject: `Welcome to ${Config.AppName}!`,
            recipent: [userEmail.toString()],
            body: content,
            isHtmlBody: true
        }
        notificationService.sendEmail(emailReq)
        .then()
        .catch()
    }

    sendPaymentNotification(notifReq: IPaymentNotificationReq){
        searchService.searchUserByAccountNumber(notifReq.requestId, notifReq.accountNo)
        .then(resp=>{
            if(resp.code == ResponseCodes.SUCCESS){
                const user : ISearchAppUserResult = resp.data;
                notifReq.userEmail = user.email.toString();
                let content = this.getTemplate('../../../email-templates/mono-transaction.html');
               
                const maskedAccountNo = notifReq.accountNo.slice(9).padStart(notifReq.accountNo.length, '*');

                content = content.replace('{{title}}', notifReq.title);
                content = content.replace('{{accountNo}}', maskedAccountNo);
                content = content.replace('{{amount}}', notifReq.amount.toString());
                content = content.replace('{{convenienceFee}}', notifReq.convenienceFee?.toString());
                content = content.replace('{{narration}}', notifReq.narration);
                content = content.replace('{{transactionRef}}', notifReq.tranId);
                content = content.replace('{{date}}', notifReq.date.toString());
                content = content.replace('{{balance}}', notifReq.balance?.toString());
              
                let emailReq: ISendEmailReq = {
                    requestId: notifReq.requestId,
                    subject: `Transaction Notification`,
                    recipent: [user.email.toString()],
                    body: content,
                    isHtmlBody: true
                }
                notificationService.sendEmail(emailReq)
                .then()
                .catch()

            }
            else{
                logActivity(notifReq.requestId, 'sendPaymentNotification', resp);
            }
        })
        .catch(err=>{
            logActivity(notifReq.requestId, 'sendPaymentNotification', err);
        })
       
    }

    private getTemplate(filePath: string): string{

        const templatePath = path.join(__dirname, filePath);
        //console.log('path', templatePath);
        let content = fs.readFileSync(templatePath,{encoding: "utf-8"});
        return content;
    }

}

export default new EmailManager();