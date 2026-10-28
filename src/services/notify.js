const db=require('../config/db');
async function send({userId,channel,to,subject,body}){if(process.env.NOTIFY_MODE==='live'){if(channel==='email')return require('./mailer').send(to,subject,body);return require('./sms').send(to,body);}await db.execute('INSERT INTO sent_messages(user_id,channel,recipient,subject,body,status) VALUES(?,?,?,?,?,?)',[userId,channel,to,subject,body,'simulated']);}
module.exports={send};
