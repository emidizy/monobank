//Initialize express router 
import * as express from 'express';
import onboardingRoutes from './onboarding-routes';
import authRoutes from './auth-routes';
import { profile } from 'winston';
import profileRoutes from './profile-routes';
import transferRoutes from './transfer-routes';
import sessionManager from '../interceptors/session-manager';

class ApiRoutes {
    public router = express.Router();
    
    constructor(){
        this.initBaseRoute();
        this.initOnboardingRoutes();
        this.initAuthorizationRoutes();
        this.initUserProfileRoutes();
        this.initTransferRoutes();
    }

    initBaseRoute(){
        this.router.get('/', (req, res, resLogger) => {
            let response = {
                status: 'Api is LIVE',
                message: 'Welcome to Mono Bank API hub. Developed by Diala Emmanuel'
            }

            res.locals.logInfo = response;
            res.json(response);
            resLogger();
        });
    }

    initOnboardingRoutes(){
        this.router.use('/onboarding', sessionManager.validateSessionToken, onboardingRoutes.routes);
    }

    initAuthorizationRoutes(){
        this.router.use('/authorization', sessionManager.validateSessionToken, authRoutes.routes);
    }


    initUserProfileRoutes(){
        this.router.use('/profile', sessionManager.validateSessionToken, profileRoutes.routes);
    }

    initTransferRoutes(){
        this.router.use('/transfer', sessionManager.validateSessionToken, transferRoutes.routes);
    }


}

export default new ApiRoutes().router;