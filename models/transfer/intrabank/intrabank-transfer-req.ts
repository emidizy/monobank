

import joi from '@hapi/joi';
                    
// define the validation schema
export const IntraBankTransferReq = joi.object().keys({

    userId: joi.string().required(),

    sourceAccount: joi.string().max(10).required(),

    destinationAccount: joi.string().max(10).required(),

    recipientName: joi.string().max(100).required(),

    clientTranId: joi.string().max(60),

    narration: joi.string().max(100).required(),

    amount: joi.number().min(1).required(),

    pin: joi.string().required(),
    
    hash: joi.string()
});

