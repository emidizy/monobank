import axios from 'axios';
import { winstonLogger as logger } from './logger';

class HttpClient {

    constructor(){
        this.initInterceptor();
    }

    initInterceptor(){
        // Add a request interceptor
        axios.interceptors.request.use((config)=>{
            // Do something before request is sent
            config.headers['post'] = { 'Content-Type': 'application/json; charset=utf-8' }

            if(config.url.startsWith(process.env.WalletBaseUrl)){
                
                config.headers['Authorization'] = "Bearer " + process.env.WalletBearerToken;
            }
            else if(config.url.startsWith(process.env.FlutterwaveBaseUrl)){
                
                config.headers['Authorization'] = "Bearer " + process.env.FlutterwaveSecretKey;
            }

            return config;
        }, function (error) {
            // Do something with request error
            return Promise.reject(error);
        });
        
        // Add a response interceptor
        axios.interceptors.response.use((response)=> {
            // Any status code that lie within the range of 2xx cause this function to trigger
            // Do something with response data
            console.log(response.data);
            logger.log('info', `${new Date().toLocaleTimeString()}|Http Response: ${JSON.stringify(response.data)}`);
            return response;
        }, function (error) {
            // Any status codes that falls outside the range of 2xx cause this function to trigger
            // Do something with response error
            //console.log(error.response)
            logger.log('info', `${new Date().toLocaleTimeString()}|Http Error Response: ${JSON.stringify(error.response.data)}`);
            return Promise.reject(error?.response);
        });
    }

    async get(url: string){
        return await axios.get(url);
    }

    async post(url: string, params?: any){
        
        if(url.startsWith(process.env.WalletBaseUrl)){
            if(params) params['secretKey'] = process.env.WalletSecret;
            //check phone number format
            if(params?.phoneNumber && params?.phoneNumber?.startsWith('+234')){
                params.phoneNumber = params.phoneNumber.replace('+234', '0');
            }
        }
        console.log('requestParams', params);
        return await axios.post(url, params);
    }
}

export default new HttpClient();