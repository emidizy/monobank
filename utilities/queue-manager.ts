
import queue from 'bull'
import { Config } from '../config';
import { logActivity } from '../interceptors/request-logger';

class QueueManager {

    batchCreditQueue: queue.Queue<any>;
    serviceChargeQueueId: string = 'servicecharge';
    profileActivityQueueId: string = 'profileActivity';
    transferNotificationQueueId: string = 'transferNotification';
    
    constructor() {
        this.initializeQueue();
    }

    private initializeQueue(){
        this.batchCreditQueue = this.createQueue('batchCredit');
    }

    private createQueue(name: string){
        if(process.env.NODE_ENV == 'production'){
            let que = new queue(name, {redis: {port: parseInt(process.env.RedisPORT), host: process.env.RedisHostUrl}});
            return que;
        }
        else{
            let que = new queue(name, {redis: {port: 6379, host: '127.0.0.1'}});
            return que;
        }
        
    }

    doBackgroundTask(requestId: string, queueId: string, functionToExecute: any){
        const taskQueue = this.createQueue(queueId);

        taskQueue.process(async ()=>{
            await functionToExecute()
            .then(result=>{
                console.log(result);
                logActivity(requestId, 'QueueManager|doBackgroundTask|ok', result);
            })
            .catch(err=>{
                console.log(err);
                logActivity(requestId, 'QueueManager|doBackgroundTask|err', err);
            })
        });
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

export default new QueueManager();