
import joi from '@hapi/joi';


// define the validation schema
export const balanceInquiryReq = joi.object().keys({


   // userId is required
   userId: joi.string().required(),

   accountNumber: joi.string().length(10)
});
