
import joi from '@hapi/joi';
                    
// define the validation schema
export const transferHistoryReq = joi.object().keys({

    accountNo: joi.string().required(),

    days: joi.number().required(),
    
    hash: joi.string()
});