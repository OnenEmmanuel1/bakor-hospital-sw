const states=['open','partially_paid','paid'];
function status(total,paid){if(paid>=total)return states[2];if(paid>0)return states[1];return states[0];}
module.exports={status};
