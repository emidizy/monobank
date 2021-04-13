import nodemailer from 'nodemailer';
import { ISendEmailReq } from '../../models/email/isend-email-req';
import { response } from 'express';
import { logActivity } from '../../interceptors/request-logger';
import { Config } from '../../config';

const africastalking = require('africastalking')({
    apiKey: '145cc19323bdcbf7287a70452731f6880500ac5f9b2ecced1bbc0b27a7f4b642',         // use your sandbox app API key for development in the test environment
    username: 'sandbox',      // use 'sandbox' for development in the test environment
});

class NotificationService {
   
    async sendEmail(emailReq: ISendEmailReq){

        let testAccount = await nodemailer.createTestAccount();
        const smtpConfig = Config.SMTPClient;

        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "in-v3.mailjet.com",
            //service: 'gmail.com',
            port: 587, 
            secure: false, // true for SSL(465), false for other ports
            requireTLS: true,
            auth: {
                user: smtpConfig.username, //testAccount.user, // generated ethereal user
                pass: smtpConfig.password//testAccount.pass, // generated ethereal password
            }
        });

        let recipients = "";
        for(let user of emailReq.recipent){
            if(recipients.length == 0){
                recipients = `${user}`
            }
            else{
                recipients = `${recipients}, ${user}`
            }
            
        }

        console.log(recipients);
        
        // send mail with defined transport object
        await transporter.sendMail({
            from: smtpConfig.sender, // sender address
            to: recipients, // list of comma seperatedreceivers
            subject: emailReq.subject, 
            text: !emailReq.isHtmlBody ? emailReq.body : null, 
            html: emailReq.isHtmlBody ? emailReq.body : null 
        })
        .then(response=>{
            emailReq['status'] = 'success';
            emailReq['clientResponse'] = response;
            emailReq.body = '<Removed for Brevity>';
            logActivity(emailReq.requestId.toString(), 'mailClient : sendEmail', emailReq);
        })
        .catch(err=>{
            emailReq['status'] = 'failed';
            emailReq['clientResponse'] = err;
            emailReq.body = '<Removed for Brevity>';
            logActivity(emailReq.requestId.toString(), 'mailClient : sendEmail', emailReq);
        });

    }


}

export default new NotificationService();