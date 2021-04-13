"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.winstonLogger = exports.Logger = void 0;
const winston_1 = __importDefault(require("winston"));
class Logger {
    constructor() {
        // define the custom settings for each transport (file, console)
        this.options = {
            file: {
                level: 'info',
                filename: `logs/info/${new Date().toDateString()}.log`,
                handleExceptions: true,
                json: true,
                maxsize: 5242880,
                maxFiles: 500,
                colorize: true,
            },
            error: {
                level: 'error',
                filename: `logs/errors/${new Date().toDateString()}.log`,
                handleExceptions: true,
                json: true,
                maxsize: 5242880,
                maxFiles: 500,
                colorize: true,
            },
            console: {
                level: 'debug',
                handleExceptions: true,
                json: true,
                colorize: true,
                format: winston_1.default.format.simple()
            },
        };
        this.createLogger();
    }
    createLogger() {
        // instantiate a new Winston Logger with the settings defined above
        this.logger = winston_1.default.createLogger({
            transports: [
                new winston_1.default.transports.File(this.options.error),
                new winston_1.default.transports.File(this.options.file),
                new winston_1.default.transports.Console(this.options.console)
            ],
            exitOnError: false,
        });
        // create a stream object with a 'write' function that will be used by `morgan`
        this.logger.stream = {
            write: (message, encoding) => {
                // use the 'info' log level so the output will be picked up by both transports (file and console)
                this.logger.info(message);
                this.logger.error(message);
            },
        };
    }
}
exports.Logger = Logger;
exports.winstonLogger = new Logger().logger;
//# sourceMappingURL=logger.js.map