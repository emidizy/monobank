
export class Config {

    public static AppName: string = 'Mono Bank';
    public static MongoDBURI: string = 'mongodb+srv://guest:guest123@mongodevdb-ffn1b.mongodb.net/mono-bank?retryWrites=true&w=majority';
    public static PORT: number = 4000;
    public static SECRET:string = 'QVf21t7bvc0=s;mscm%^JH';
    public static RedisHostUrl:string = '//redis-14962.c90.us-east-1-3.ec2.cloud.redislabs.com:14962'; //change this config on server.ts and QueueManager.ts
    public static RedisPORT:number = 14962 || 6379; //change this config on server.ts and QueueManager.ts
    public static RedisPassword: string = 'hZnIcbRbW9flqqKS9DlSXDcuEmwQV2Z6';
    public static ValidationSalt: string = 'hVus7!ns78e^*e9c8eV20nst26jdiZ9';
    public static MaxTokenAge: number = 1200000;
    public static SMTPClient: any = {
        username: 'b25929ed7294bef935a796a31288bcfb', 
        password: 'b8d1354d28e3d2bb6b41a134144985b3',
        sender: '"Mono Bank" <payevenng@gmail.com>'
    }
    public static EncryptionKey: string = '$LarkM&oNt@R!0zaOpV6Ms0Xg2rTu9l$';
    public static IV: string = '$h35kM@1V0lT#gE7';
    public static NonAuthResources: string[] = ['/signup', '/login']
}
