

import joi from '@hapi/joi';
                    
// define the validation schema
export const getTxChargeReq = joi.object().keys({

    userId: joi.string().required(),

    amount: joi.number().min(0).required(),

    transferType: joi.string().required()
    
});