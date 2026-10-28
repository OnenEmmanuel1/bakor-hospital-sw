const transitions = { requested:['sample_collected','cancelled'], sample_collected:['resulted'], resulted:['released'] };
function assertTransition(from,to) { if(!transitions[from]?.includes(to)) throw Object.assign(new Error(`Invalid lab transition: ${from} to ${to}`),{status:409}); }
function flag(value, low, high) { if(value==null || low==null || high==null || !Number.isFinite(Number(value))) return null; return Number(value)<low?'low':Number(value)>high?'high':'normal'; }
module.exports={transitions,assertTransition,flag};
