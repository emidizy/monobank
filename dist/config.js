"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
class Config {
}
exports.Config = Config;
Config.AppName = 'PayEven';
Config.MongoDBURI = 'mongodb+srv://guest:guest123@mongodevdb-ffn1b.mongodb.net/pay-even?retryWrites=true&w=majority';
Config.PORT = 4000;
Config.SECRET = 'QVf21t7bvc0=s;mscm%^JH';
Config.WalletSecret = 'e2sy4qcq80xc';
Config.WalletBaseUrl = 'https://sandbox.wallets.africa';
Config.WalletBearerToken = 'zp2jvwgywszt';
Config.FlutterwaveBaseUrl = 'https://api.flutterwave.com/v3';
Config.FlutterwaveSecretKey = 'FLWSECK_TEST-1dc4c9e11c92715b31a6978357172fdd-X';
Config.FlutterwaveWebhookSecret = 'nowthishappenspleasebesafemysecrethash';
Config.RedisHostUrl = '//redis-14962.c90.us-east-1-3.ec2.cloud.redislabs.com:14962'; //change this config on server.ts and QueueManager.ts
Config.RedisPORT = 14962 || 6379; //change this config on server.ts and QueueManager.ts
Config.RedisPassword = 'hZnIcbRbW9flqqKS9DlSXDcuEmwQV2Z6';
Config.ValidationSalt = 'hVus7!ns78e^*e9c8eV20nst26jdiZ9';
Config.MaxTokenAge = 1200000;
Config.SMTPClient = {
    username: 'b25929ed7294bef935a796a31288bcfb',
    password: 'b8d1354d28e3d2bb6b41a134144985b3',
    sender: '"PayEven" <payevenng@gmail.com>'
};
Config.EncryptionKey = '$LarkM&oNt@R!0zaOpV6Ms0Xg2rTu9l$';
Config.IV = '$h35kM@1V0lT#gE7';
Config.NonAuthResources = ['/signup', '/login', '/token/offapp/send', '/token/offapp/verify',
    '/fw/payment/save', '/password/reset/initialize', '/password/reset/complete'];
//# sourceMappingURL=config.js.map