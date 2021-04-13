// Import User schema/model
import users from '../database/schemas/user';
import signupService from '../services/onboarding/signup-service';
import responseHandler from '../utilities/response-handler';
import {signupReq} from '../models/signup/signup-req';
import {  generateNewBankAccountReq } from '../models/signup/generate-new-bank-account-req';
import { ResponseCodes } from '../models/response-codes';
import sessionManager from '../interceptors/session-manager';
import { IClientAppUser } from '../models/profile/user/iapp-user';

class SignupController {

    async createAccount(req: any, res: any, next) {
        
        let response = null;
        let status: Number = 200;
        let requestId = responseHandler.generateUniqueId();
        console.log(requestId);
        try {
            const { value, error } = signupReq.validate(req.body); 

            if (error) {
                response = responseHandler
                    .commitResponse(requestId, "422", 'Invalid request body', error);
                 status = 422;
                
            }
            else{
               
                await signupService.createAccount(requestId, req.body)
                .then(async resp=>{
                    response = resp;
                     //SET SESSION TOKEN UPON SUCCESSFUL ACCOUNT CREATION
                     if(response.code == ResponseCodes.SUCCESS){
                        const user:IClientAppUser = resp.data;
                        const sessionData = {userId: user.phone}
                        await sessionManager.setSessionToken(req, sessionData)
                        .then(sessionReq=>{
                            req = sessionReq;
                            if(!req.session.accessToken){
                                response = responseHandler
                                    .commitResponse(requestId, ResponseCodes.SESSION_CREATE_ERR, 'Account creation successful. Kindly login to continue');
                            }
                            //else, user is automatically logged in after account creation
                        })
                        .catch(err=>{
                            response = responseHandler
                                .commitResponse(requestId, ResponseCodes.UNSUCCESSFUL, 'Sorry, we were unable to log you in at this time. Kindly check back in a moment');
                        });
                    }
                });
            }
              console.log(`value: ${value} | error: ${error}`)  
        } 
        catch (err) {
            response = responseHandler.handleException(requestId)
        }
        
        res.locals.logInfo = response;
        res.status(status).send(response);
        next();
    }

    async generateAdditionalBankAccount(req: any, res: any, next) {
        
        let response = null;
        let status: Number = 200;
        let requestId = responseHandler.generateUniqueId();
        console.log(requestId);
        try {
            const { value, error } = generateNewBankAccountReq.validate(req.body); 

            if (error) {
                response = responseHandler
                    .commitResponse(requestId, "422", 'Invalid request body', error);
                 status = 422;
                
            }
            else{
               
                await signupService.generateAdditionalBankAcount(requestId, req.body)
                .then(async resp=>{
                    response = resp;
                });
            }
              console.log(`value: ${value} | error: ${error}`)  
        } 
        catch (err) {
            response = responseHandler.handleException(requestId)
        }
        
        res.locals.logInfo = response;
        res.status(status).send(response);
        next();
    }

   
}

export default new SignupController();

        
