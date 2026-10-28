const fs=require('node:fs');
const path=require('node:path');

function mysqlOptions({database=true}={}){
  const encodedCa=process.env.DB_SSL_CA_BASE64;
  const caValue=process.env.DB_SSL_CA?.replace(/\\n/g,'\n');
  const ca=encodedCa?Buffer.from(encodedCa,'base64').toString('utf8'):caValue?(caValue.includes('-----BEGIN CERTIFICATE-----')?caValue:fs.readFileSync(path.resolve(caValue),'utf8')):null;
  if(process.env.DB_SSL==='required'&&!ca)throw new Error('DB_SSL is required but DB_SSL_CA_BASE64 or DB_SSL_CA is not set.');
  return {
    host:process.env.DB_HOST,
    port:Number(process.env.DB_PORT||3306),
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    ...(database?{database:process.env.DB_NAME}:{}),
    waitForConnections:true,
    connectionLimit:5,
    connectTimeout:10000,
    charset:'utf8mb4',
    ...(ca?{ssl:{ca,rejectUnauthorized:true,verifyIdentity:true}}:{})
  };
}

module.exports=mysqlOptions;
