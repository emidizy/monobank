"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const redis_1 = __importDefault(require("redis"));
const express_session_1 = __importDefault(require("express-session"));
const redisstorage = __importStar(require("connect-redis")); //const redisStore = require('connect-redis')(session);
const routes = __importStar(require("./routes/api-routes"));
const bodyparser = __importStar(require("body-parser"));
const multer_1 = __importDefault(require("multer"));
const appconfig = __importStar(require("./config"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swaggerDocument = __importStar(require("./swagger.json"));
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = require("./utilities/logger");
const request_logger_1 = require("./interceptors/request-logger");
const dotenv = __importStar(require("dotenv"));
class Server {
    constructor() {
        this.environment = dotenv.config();
        //config = appconfig.Config;
        this.config = process.env;
        this.session = express_session_1.default;
        this.redisStore = redisstorage.default(express_session_1.default);
        this.app = express_1.default();
        this.configureExpressSession();
        this.initDatabase();
        this.configureCORS();
        this.allowFileUploads();
        this.mountRoutes();
        this.configureLogging();
        this.startApplication();
    }
    configureExpressSession() {
        //App Session
        let redisClient;
        let sessionStore;
        let cookieConfig;
        const isDevMode = process.env.NODE_ENV === 'development';
        if (isDevMode) {
            redisClient = redis_1.default.createClient();
            sessionStore = new this.redisStore({ host: '127.0.0.1', port: 6379, client: redisClient, ttl: 86400 });
            cookieConfig = { maxAge: 18000000, secure: false };
        }
        else {
            this.app.set('trust proxy', 1);
            redisClient = redis_1.default.createClient(this.config.RedisHostUrl, { no_ready_check: true, auth_pass: this.config.RedisPassword });
            sessionStore = new this.redisStore({ host: this.config.RedisHostUrl,
                port: appconfig.Config.RedisPORT, client: redisClient, ttl: this.config.MaxTokenAge });
            cookieConfig = { maxAge: 18000000, secure: true, httpOnly: false, sameSite: "none" };
            console.log('App is on prod mode!', process.env.NODE_ENV);
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
        redisClient.on('connect', () => {
            console.log('Redis client connected');
        });
        redisClient.on('error', function (err) {
            console.log('Connection to reddis client failed -' + err);
        });
    }
    initDatabase() {
        //App mongoose client instance connection
        mongoose_1.default.Promise = global.Promise;
        const dbConString = this.config.MongoDBURI;
        mongoose_1.default.connect(dbConString, { useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false })
            .then(db => {
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
            .catch(err => console.log("Error establishing connection to database"));
    }
    allowFileUploads() {
        const multerMid = multer_1.default({
            storage: multer_1.default.memoryStorage(),
            limits: {
                // no larger than 5mb.
                fileSize: 5 * 1024 * 1024,
            }
        });
        this.app.disable('x-powered-by');
        let fields = [{
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
    mountRoutes() {
        this.app
            .use(bodyparser.urlencoded({
            extended: true
        }))
            .use(bodyparser.json())
            //App Routes
            .use('/swagger', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument))
            .use('/api', routes.default, request_logger_1.resLogger)
            .use('/', (req, res) => {
            //Handle 404
            if (req.url != '/') {
                let response = 'Oops! Requested URL not found';
                logger_1.winstonLogger.log('error', response);
                return res.status(404).send(response);
            }
            res.redirect('/api');
        });
    }
    configureCORS() {
        this.app.use(cors_1.default({
            origin: ['http://localhost', 'http://localhost:8100'],
            credentials: true
        }));
    }
    configureLogging() {
        this.app.use(morgan_1.default('combined', { stream: logger_1.winstonLogger.stream }));
    }
    startApplication() {
        //App PORT
        const port = process.env.PORT || this.config.PORT;
        this.app.on('dbReady', () => {
            this.app.listen(port, () => {
                console.log(`Application listening on port ` + port);
                this.app.emit('appReady');
            });
        });
    }
}
exports.default = new Server().app;
//# sourceMappingURL=server.js.map