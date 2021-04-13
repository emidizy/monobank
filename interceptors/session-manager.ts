//import json web token
import * as jwt from 'jsonwebtoken'
import responseHandler from '../utilities/response-handler';
import { ResponseCodes } from '../models/response-codes';
import { logActivity } from './request-logger';
import cipher from '../utilities/cipher';
import { Config } from '../config';

class SessionManager {
    //private jwt = jsonwebtoken;

    constructor(){
    }

    generateJWTTokenEncrypted(data: any){
        return new Promise<string>((resolve, reject)=>{
            //Set token to expire in 20 mins
            jwt.sign(data, Config.SECRET, {expiresIn: Config.MaxTokenAge}, (err, token)=>{
                console.log('token',err);
                console.log('token', token)
                if(err){
                    logActivity('N/A', 'TokenManager|generateJWT|err', err);
                    reject(null);
                }

                else {
                    const encyptedToken = cipher.encryptSync(token);
                    if(!encyptedToken) {
                        reject(null);
                    }
                    else resolve(encyptedToken);
                }
            });
        })
    
    }

    async  validateSessionToken(req, res, next){
        
        //Ignore Endpoints that do not require authorization
        const url: string = req.url;
        if(Config.NonAuthResources.includes(url)){
            return next();
        }

        let accessToken = null;
        if(req.session)  accessToken  = req.session.accessToken;
        //console.log('session', req.session);
        
        if(!accessToken){
            let response = responseHandler.commitResponse(
                "xxxxx", 
                ResponseCodes.UNAUTHORIZED,
                'This resource requires authorization.',
                'Err401: Invalid Authorization. No access token');
            return res.status(401).send(response);
        }
        let authData = null;   
        //decrypt JWT token
        let token = cipher.decryptSync(accessToken);

        if(!token){
            let response = responseHandler.commitResponse(
                "xxxxx", 
                ResponseCodes.UNAUTHORIZED,
                'This resource requires authorization.',
                'Err401: Invalid Authorization. Invalid access token');
            return res.status(401).send(response);
        }
        else{
            jwt.verify(token, Config.SECRET, (err, data)=>{
                if(err) authData = null;
        
                authData = data;
            });

            if(!authData){
                let response = responseHandler.commitResponse(
                    "xxxxx", 
                    ResponseCodes.SESSION_EXPIRED,
                    'Sorry, Invalid or expired session detected. Please log in');
                return res.status(200).send(response);
            }

            res.locals.user = authData;
        }
        
        next();
    }

    async setSessionToken(req: any, sessionData: any){
        let accessToken: string = null;

        await this.generateJWTTokenEncrypted(sessionData)
        .then(token=>{
            if(token){
                accessToken = token;
            }
        })
        .catch(err=> console.log(err));

        req.session.accessToken = accessToken;
        return req;
    }
}

export default new SessionManager();







