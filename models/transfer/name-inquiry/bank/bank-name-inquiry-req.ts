
import joi from '@hapi/joi';

export const bankNameInquiryReq = joi.object().keys({

    userId: joi.string().required(),

    accountNumber: joi.string().min(10).max(10).required()
});