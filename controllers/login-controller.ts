import responseHandler from "../utilities/response-handler";
import { loginReq } from "../models/auth/login/login-req";
import loginService from "../services/auth/login-service";
import { IResponse } from "../models/response/response";
import { ResponseCodes } from "../models/response-codes";
import sessionManager from "../interceptors/session-manager";
import { IClientAppUser } from "../models/profile/user/iapp-user";

class LoginController {

    async doLogin(req: any, res: any, next) {
        
        let response:IResponse = null;
        let status: Number = 200;
        let requestId = responseHandler.generateUniqueId();
        console.log(requestId);
        try {
            const { value, error } = loginReq.validate(req.body); 

            if (error) {
                response = responseHandler
                    .commitResponse(requestId, "422", 'Invalid request body', error);
                status = 422;
                
            }
            else{
                await loginService.doLogin(requestId, req.body)
                .then(async resp=>{
                    response = resp;
                    //SET SESSION TOKEN UPON SUCCESSFUL LOGIN
                    if(response.code == ResponseCodes.SUCCESS){
                        const user:IClientAppUser = resp.data;
                        const sessionData = {userId: user.phone}
                        await sessionManager.setSessionToken(req, sessionData)
                        .then(sessionReq=>{
                            req = sessionReq;
                            //console.log(req.session)
                            if(!req.session.accessToken){
                                response = responseHandler
                                    .commitResponse(requestId, ResponseCodes.SESSION_CREATE_ERR, 'Sorry, we were unable to complete your login. Kindly check back in a moment');
                            }
                        })
                        .catch(err=>{
                            response = responseHandler
                                .commitResponse(requestId, ResponseCodes.UNSUCCESSFUL, 'Sorry, we were unable to complete your login. Kindly check back in a moment');
                        });
                    }
                })
                .catch(err=>{
                    response = err;
                });
            } 
        } 
        catch (err) {
            response = responseHandler.handleException(requestId)
        }
        
        res.locals.logInfo = response;
        res.status(status).send(response);
        next();
    }

}

export default new LoginController();