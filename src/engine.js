const {permissions,can,landing}=require('./engine/access');
const transitions={booked:['checked_in','cancelled','no_show'],checked_in:['in_consultation','cancelled'],in_consultation:['completed']};
function transition(from,to){if(!transitions[from]?.includes(to))throw Object.assign(new Error(`Invalid appointment transition: ${from} to ${to}`),{status:409});return to;}
module.exports={permissions,can,landing,transition,...require('./engine/scheduling'),lab:require('./engine/lab'),pharmacy:require('./engine/pharmacy'),billing:require('./engine/billing'),crypto:require('./engine/crypto')};
