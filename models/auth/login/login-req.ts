
import joi from '@hapi/joi';


// define the validation schema
export const loginReq = joi.object().keys({

   userId: joi.string().required(),

   password: joi.string().required(),

   appVersion: joi.string().optional()

});
