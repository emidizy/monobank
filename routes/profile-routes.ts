//Initialize express router 
import * as express from 'express';
import profileController from '../controllers/profile-controller';

class ProfileRoutes {
    public routes = express.Router();
    
    constructor(){
        this.initRoutes();
    }

    private initRoutes(){
        this.routes.post('/search', profileController.searchUser);
        this.routes.get('/users/all', profileController.getAllUsers);
        this.routes.post('/inquiry/account/balance', profileController.getUserAccountBalance);
    }
    

}

export default new ProfileRoutes();