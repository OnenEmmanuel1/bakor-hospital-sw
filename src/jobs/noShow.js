const db=require('../config/db');module.exports=()=>db.execute("UPDATE appointments SET status='no_show' WHERE status='booked' AND appt_date<CURRENT_DATE");
