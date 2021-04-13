import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import redis, { RedisClient } from 'redis';
import session from 'express-session';
import * as redisstorage from 'connect-redis'; //const redisStore = require('connect-redis')(session);
import * as routes from './routes/api-routes';
import * as bodyparser from 'body-parser';
import multer, { Field } from 'multer';
import * as appconfig from './config';
import swaggerUi from 'swagger-ui-express'
import * as swaggerDocument from './swagger.json'
import morgan from 'morgan'; 
import {winstonLogger} from './utilities/logger'
import { resLogger, reqLogger } from './interceptors/request-logger';
import * as dotenv from 'dotenv';
import fees from './database/schemas/fees';



class Server {
   //App Instance
    public app;
    environment = dotenv.config();
    //config = appconfig.Config;
    config = process.env;

    session = session;
    redisStore = redisstorage.default(session);
    
    constructor(){
        this.app = express();
        this.configureExpressSession();
        this.initDatabase();
        this.configureCORS();
        this.allowFileUploads();
        this.mountRoutes();
        this.configureLogging();
        this.startApplication();
    }

    private configureExpressSession(){
        //App Session
        let redisClient: RedisClient;
        let sessionStore: any;
        let cookieConfig: any;
        const isDevMode = process.env.NODE_ENV === 'development';

        if (isDevMode) {
             redisClient = redis.createClient();
             sessionStore = new this.redisStore({ host: '127.0.0.1',port: 6379, client: redisClient, ttl :  86400 });
             cookieConfig = { maxAge: 18000000, secure: false};
        }
        else{
            
            this.app.set('trust proxy', 1);
            redisClient = redis.createClient(this.config.RedisHostUrl, 
                { no_ready_check: true, auth_pass: this.config.RedisPassword}); 
            sessionStore = new this.redisStore({ host: this.config.RedisHostUrl, 
                port: appconfig.Config.RedisPORT, client: redisClient, ttl :  this.config.MaxTokenAge });

            cookieConfig = { maxAge: 18000000, secure: true , httpOnly: false, sameSite: "none"};
            
            console.log('App is on prod mode!', process.env.NODE_ENV );
        }

        this.app.use(this.session({
            secret: this.config.SECRET,
            name: 'accessToken',
            // create new redis store.
            store: sessionStore,
            // saveUninitialized: true,
            // resave: false,
            // cookie: { maxAge: parseInt(this.config.MaxTokenAge), secure: false }
            //new
            saveUninitialized: true,
            resave: false,
            cookie: cookieConfig
        }));

        redisClient.on('connect', ()=>{
            console.log('Redis client connected');
        });
        redisClient.on('error', function (err){
            console.log('Connection to reddis client failed -' + err);
        });
    }

    private initDatabase(){
        //App mongoose client instance connection
        mongoose.Promise = global.Promise;
        const dbConString = this.config.MongoDBURI;
        mongoose.connect(dbConString, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false})
            .then(db=> {
                console.log("DB Connnection established!.");
                // fees.createCollection();
                // var newFee = new fees({
                //     bankTransfer: [{
                //         below5K: 0,
                //         btwn5KAnd50K: 10,
                //         above50K: 25,
                //         defaultProviderFee: 0
                //     }]
                // })
                // newFee.save().then().catch();
                this.app.emit('dbReady'); 
            })
            .catch(err=> console.log("Error establishing connection to database"));

    }

    private allowFileUploads(){
        const multerMid = multer({
            storage: multer.memoryStorage(),
            limits: {
              // no larger than 5mb.
              fileSize: 5 * 1024 * 1024,
            }
          });
          
          this.app.disable('x-powered-by');
          let fields:Field[] = [{
              name: 'userId',
              maxCount: 1
            },
            {
                name: 'idType',
                maxCount: 1
              },
            {
                name: 'idSerialNumber', 
                maxCount: 1
            },
            {
                name: 'idFile',
                maxCount: 1
            },
            {
                name: 'userPhoto',
                maxCount: 1
            }
          ];
          this.app.use(multerMid.fields(fields));
    }

    private mountRoutes(){
        this.app
        .use(bodyparser.urlencoded({
            extended: true
        }))
        .use(bodyparser.json())

        //App Routes
        .use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
        .use('/api', routes.default, resLogger) 
        .use('/', (req, res)=>{
            //Handle 404
            if(req.url != '/') {
                let response = 'Oops! Requested URL not found';
                winstonLogger.log('error', response);
                return res.status(404).send(response);
            }
            res.redirect('/api');
        });
    }

    private configureCORS(){
        this.app.use(cors({
            origin: ['http://localhost', 'http://localhost:8100'],
            credentials: true
        }))
    }

    private configureLogging(){
        this.app.use(morgan('combined', { stream: winstonLogger.stream }));
    }

    public startApplication(){
        //App PORT
        const port = process.env.PORT || this.config.PORT; 
        this.app.on('dbReady', ()=>{
            this.app.listen(port, () => {
                console.log(`Application listening on port ` + port);
                this.app.emit('appReady');
            })   
        
        });
    }

}

export default new Server().app;

