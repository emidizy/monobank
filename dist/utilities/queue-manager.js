"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bull_1 = __importDefault(require("bull"));
const request_logger_1 = require("../interceptors/request-logger");
class QueueManager {
    constructor() {
        this.serviceChargeQueueId = 'servicecharge';
        this.profileActivityQueueId = 'profileActivity';
        this.transferNotificationQueueId = 'transferNotification';
        this.initializeQueue();
    }
    initializeQueue() {
        this.batchCreditQueue = this.createQueue('batchCredit');
    }
    createQueue(name) {
        if (process.env.NODE_ENV == 'production') {
            let que = new bull_1.default(name, { redis: { port: parseInt(process.env.RedisPORT), host: process.env.RedisHostUrl } });
            return que;
        }
        else {
            let que = new bull_1.default(name, { redis: { port: 6379, host: '127.0.0.1' } });
            return que;
        }
    }
    doBackgroundTask(requestId, queueId, functionToExecute) {
        const taskQueue = this.createQueue(queueId);
        taskQueue.process(() => __awaiter(this, void 0, void 0, function* () {
            yield functionToExecute()
                .then(result => {
                console.log(result);
                request_logger_1.logActivity(requestId, 'QueueManager|doBackgroundTask|ok', result);
            })
                .catch(err => {
                console.log(err);
                request_logger_1.logActivity(requestId, 'QueueManager|doBackgroundTask|err', err);
            });
        }));
        // taskQueue.process(functionToExecute)
        // .then(result=>{
        //     console.log(result);
        //     logActivity(requestId, 'QueueManager|doBackgroundTask|ok', result);
        // })
        // .catch(err=>{
        //     console.log(err);
        //     logActivity(requestId, 'QueueManager|doBackgroundTask|err', err);
        // })
    }
}
exports.default = new QueueManager();
//# sourceMappingURL=queue-manager.js.map