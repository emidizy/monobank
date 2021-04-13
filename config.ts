
export class Config {

    public static AppName: string = 'PayEven';
    public static MongoDBURI: string = 'mongodb+srv://guest:guest123@mongodevdb-ffn1b.mongodb.net/pay-even?retryWrites=true&w=majority';
    public static PORT: number = 4000;
    public static SECRET:string = 'QVf21t7bvc0=s;mscm%^JH';
    public static WalletSecret:string = 'e2sy4qcq80xc';
    public static WalletBaseUrl:string = 'https://sandbox.wallets.africa';
    public static WalletBearerToken:string = 'zp2jvwgywszt'; 
    public static FlutterwaveBaseUrl:string = 'https://api.flutterwave.com/v3';
    public static FlutterwaveSecretKey:string = 'FLWSECK_TEST-1dc4c9e11c92715b31a6978357172fdd-X';
    public static FlutterwaveWebhookSecret:string = 'nowthishappenspleasebesafemysecrethash';
    public static RedisHostUrl:string = '//redis-14962.c90.us-east-1-3.ec2.cloud.redislabs.com:14962'; //change this config on server.ts and QueueManager.ts
    public static RedisPORT:number = 14962 || 6379; //change this config on server.ts and QueueManager.ts
    public static RedisPassword: string = 'hZnIcbRbW9flqqKS9DlSXDcuEmwQV2Z6';
    public static ValidationSalt: string = 'hVus7!ns78e^*e9c8eV20nst26jdiZ9';
    public static MaxTokenAge: number = 1200000;
    public static SMTPClient: any = {
        username: 'b25929ed7294bef935a796a31288bcfb', 
        password: 'b8d1354d28e3d2bb6b41a134144985b3',
        sender: '"PayEven" <payevenng@gmail.com>'
    }
    public static EncryptionKey: string = '$LarkM&oNt@R!0zaOpV6Ms0Xg2rTu9l$';
    public static IV: string = '$h35kM@1V0lT#gE7';
    public static NonAuthResources: string[] = ['/signup', '/login', '/token/offapp/send', '/token/offapp/verify',  
        '/fw/payment/save', '/password/reset/initialize', '/password/reset/complete']
}
