
import joi from '@hapi/joi';


 // define the validation schema
 export const signupReq = joi.object().keys({

    // email is required
    // email must be a valid email string
    firstname: joi.string().required(),

    // email is required
    // email must be a valid email string
    lastname: joi.string().required(),

    // email is required
    // email must be a valid email string
    email: joi.string().email().required(),

    // phone is required
    // and must be a string of the format +234XXXXXXXXXX
    // where X is a digit (0-9)
    phone: joi.string().regex(/(\+)\d{13}$/).required(),

    dob: joi.string().min(8).required(),

    password: joi.string().min(6).required(),
    
    pin: joi.string().min(4).required(),

    depositAmount: joi.number().min(0).required(),

    country: joi.string().max(4).required()

});
