
import joi from '@hapi/joi';


// define the validation schema
export const generateNewBankAccountReq = joi.object().keys({

   // phone is required
   // and must be a string of the format +234XXXXXXXXXX
   // where X is a digit (0-9)
   phone: joi.string().regex(/(\+)\d{13}$/).required()

});
