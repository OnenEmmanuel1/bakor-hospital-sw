const db=require('../config/db');
module.exports=async function(req, action, entity, id, detail=''){if(!req.user)return;await db.execute('INSERT INTO audit_log(user_id,action,entity,entity_id,detail,ip,is_read_event) VALUES(?,?,?,?,?,?,?)',[req.user.id,action,entity,id,detail,req.ip,action.startsWith('read:')]);};
