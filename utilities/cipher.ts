
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateKeyPairSync }  from 'crypto';
import { writeFileSync } from 'fs'
import { Config } from '../config';
import { logActivity } from '../interceptors/request-logger';

class Cipher {
    hash(stringToHash){
        return bcrypt.hashSync(stringToHash, 10);
    }
    
    verifyHash(value, hashedValue){
        return  bcrypt.compareSync(value, hashedValue);
    }

    encryptSync(data: string){
        try{
            if(!data) return null;
            const dataToEncypt = data;
            let cipher = crypto.createCipheriv('aes-256-cbc', Config.EncryptionKey, Config.IV);
            var encryptedStr = cipher.update(dataToEncypt, 'utf8', 'hex');
            encryptedStr += cipher.final('hex');
            return encryptedStr;
        }
        catch(err){
            console.log(err);
            logActivity('ID', 'cipher|encryptSync|err', err);
            return null;
        }
    }

    decryptSync(data){
        try{
            if(!data) return null;
            let decipher = crypto.createDecipheriv('aes-256-cbc', Config.EncryptionKey, Config.IV);
            var decryptedStr = decipher.update(data, 'hex', 'utf8');
            decryptedStr += decipher.final('utf8');
            return decryptedStr;
        }
        catch(err){
            console.log(err);
            logActivity('ID', 'cipher|decryptSync|err', err);
            return null;
        }
    }

    generatePPKeys() {
        const { privateKey, publicKey } = generateKeyPairSync('rsa', {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
          },
          privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
            cipher: 'aes-256-cbc',
            passphrase: '',
          },
        })
      
        writeFileSync('keys/private.pem', privateKey)
        writeFileSync('keys/public.pem', publicKey)
    }

    encryptAsyncRSA(data, publicKey) {
        // var absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
        // var publicKey = fs.readFileSync(absolutePath, "utf8");
        var buffer = Buffer.from(data);
        var encrypted = crypto.publicEncrypt(publicKey, buffer);
        return encrypted.toString("base64");
    };
    
    decryptAsyncRSA(data, privateKey) {
        // var absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey);
        // var privateKey = fs.readFileSync(absolutePath, "utf8");
        var buffer = Buffer.from(data, "base64");
        var decrypted = crypto.privateDecrypt(privateKey, buffer);
        return decrypted.toString("utf8");
    };
    
}


export default new Cipher();