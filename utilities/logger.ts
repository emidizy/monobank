import app from '../server';
import winston from 'winston';

export class Logger {

    // define the custom settings for each transport (file, console)
    options = {
        file: {
            level: 'info',
            filename: `logs/info/${new Date().toDateString()}.log`,
            handleExceptions: true,
            json: true,
            maxsize: 5242880, // 5MB
            maxFiles: 500,
            colorize: true,
        },
        error: {
            level: 'error',
            filename: `logs/errors/${new Date().toDateString()}.log`,
            handleExceptions: true,
            json: true,
            maxsize: 5242880, // 5MB
            maxFiles: 500,
            colorize: true,
        },
        console: {
            level: 'debug',
            handleExceptions: true,
            json: true,
            colorize: true,
            format: winston.format.simple()
        },
    };
    public logger: any;

    constructor(){
        this.createLogger();
    }
    
    createLogger(){
        // instantiate a new Winston Logger with the settings defined above
        this.logger = winston.createLogger({
            transports: [
            new winston.transports.File(this.options.error),
            new winston.transports.File(this.options.file),
            new winston.transports.Console(this.options.console)
            ],
            exitOnError: false, // do not exit on handled exceptions
        });
        
        // create a stream object with a 'write' function that will be used by `morgan`
        this.logger.stream = {
            write: (message, encoding)=> {
                // use the 'info' log level so the output will be picked up by both transports (file and console)
                this.logger.info(message);
                this.logger.error(message);
            },
        };
    }
    
    

}

export const winstonLogger = new Logger().logger;