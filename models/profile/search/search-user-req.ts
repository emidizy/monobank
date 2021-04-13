
import joi from '@hapi/joi';


// define the validation schema
export const searchUserReq = joi.object().keys({


   // userId is required
   // and must be a string of the format +234XXXXXXXXXX
   // where X is a digit (0-9)
   userId: joi.string().regex(/(\+)\d{13}$/).required(),

   nameToSearch: joi.string().allow(''),

   phoneToSearch: joi.string().allow('').regex(/(\+)\d{13}$/),

   searchByPhone: joi.boolean().required()
});
