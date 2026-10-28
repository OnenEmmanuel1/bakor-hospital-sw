require('dotenv').config();
const crypto=require('./engine/crypto');
crypto.assertKey();
if(!process.env.SESSION_SECRET||process.env.SESSION_SECRET.length<32)throw new Error('SESSION_SECRET must contain at least 32 characters.');
const app=require('./app'),port=Number(process.env.PORT||3000);
require('./jobs/scheduler');
app.listen(port,()=>console.log(`Bakor Hospital prototype listening on port ${port}`));
