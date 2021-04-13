"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const crypto_2 = require("crypto");
const fs_1 = require("fs");
const config_1 = require("../config");
const request_logger_1 = require("../interceptors/request-logger");
class Cipher {
    hash(stringToHash) {
        return bcryptjs_1.default.hashSync(stringToHash, 10);
    }
    verifyHash(value, hashedValue) {
        return bcryptjs_1.default.compareSync(value, hashedValue);
    }
    encryptSync(data) {
        try {
            if (!data)
                return null;
            const dataToEncypt = data;
            let cipher = crypto_1.default.createCipheriv('aes-256-cbc', config_1.Config.EncryptionKey, config_1.Config.IV);
            var encryptedStr = cipher.update(dataToEncypt, 'utf8', 'hex');
            encryptedStr += cipher.final('hex');
            return encryptedStr;
        }
        catch (err) {
            console.log(err);
            request_logger_1.logActivity('ID', 'cipher|encryptSync|err', err);
            return null;
        }
    }
    decryptSync(data) {
        try {
            if (!data)
                return null;
            let decipher = crypto_1.default.createDecipheriv('aes-256-cbc', config_1.Config.EncryptionKey, config_1.Config.IV);
            var decryptedStr = decipher.update(data, 'hex', 'utf8');
            decryptedStr += decipher.final('utf8');
            return decryptedStr;
        }
        catch (err) {
            console.log(err);
            request_logger_1.logActivity('ID', 'cipher|decryptSync|err', err);
            return null;
        }
    }
    generatePPKeys() {
        const { privateKey, publicKey } = crypto_2.generateKeyPairSync('rsa', {
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
        });
        fs_1.writeFileSync('keys/private.pem', privateKey);
        fs_1.writeFileSync('keys/public.pem', publicKey);
    }
    encryptAsyncRSA(data, publicKey) {
        // var absolutePath = path.resolve(relativeOrAbsolutePathToPublicKey);
        // var publicKey = fs.readFileSync(absolutePath, "utf8");
        var buffer = Buffer.from(data);
        var encrypted = crypto_1.default.publicEncrypt(publicKey, buffer);
        return encrypted.toString("base64");
    }
    ;
    decryptAsyncRSA(data, privateKey) {
        // var absolutePath = path.resolve(relativeOrAbsolutePathtoPrivateKey);
        // var privateKey = fs.readFileSync(absolutePath, "utf8");
        var buffer = Buffer.from(data, "base64");
        var decrypted = crypto_1.default.privateDecrypt(privateKey, buffer);
        return decrypted.toString("utf8");
    }
    ;
}
exports.default = new Cipher();
//# sourceMappingURL=cipher.js.map