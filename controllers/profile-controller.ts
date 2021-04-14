
import profileSearchService from '../services/profile/search-service';
import responseHandler from '../utilities/response-handler';
import {signupReq} from '../models/signup/signup-req';
import { searchUserReq } from '../models/profile/search/search-user-req';
import { balanceInquiryReq } from '../models/profile/balance-inquiry/balance-inquiry-req';
import walletProfileService from '../services/profile/account-balance-service';

class ProfileController {

    async searchUser(req: any, res: any, next) {
        
        let response = null;
        let status: Number = 200;
        let requestId = responseHandler.generateUniqueId();
        console.log(requestId);
        try {
            const { value, error } = searchUserReq.validate(req.body); 

            if (error) {
                response = responseHandler
                    .commitResponse(requestId, "422", 'Invalid request body', error);
                 status = 422;
                
            }
            else{
                await profileSearchService.searchAppUser(requestId, req.body).then(resp=>{
                    response = resp;
                })
                .catch(err=>{
                    response = err;
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

    async getUserAccountBalance(req: any, res: any, next) {
        
        let response = null;
        let status: Number = 200;
        let requestId = responseHandler.generateUniqueId();
        console.log(requestId);
        try {
            const { value, error } = balanceInquiryReq.validate(req.body); 

            if (error) {
                response = responseHandler
                    .commitResponse(requestId, "422", 'Invalid request body', error);
                 status = 422;
                
            }
            else{
                await walletProfileService.getAccountBalance(requestId, req.body).then(resp=>{
                    response = resp;
                })
                .catch(err=>{
                    response = err;
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

    async getAllUsers(req: any, res: any, next) {
        
        let response = null;
        let status: Number = 200;
        let requestId = responseHandler.generateUniqueId();
        console.log(requestId);
        try {
                await profileSearchService.getAllUsersInRawDatabaseFormat(requestId).then(resp=>{
                    response = resp;
                })
                .catch(err=>{
                    response = err;
                });
           
        } 
        catch (err) {
            
            response = responseHandler.handleException(requestId)
        }
        
        res.locals.logInfo = response;
        res.status(status).send(response);
        next();
    }


}

export default new ProfileController();

        
